using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using NovaPay.Data;
using NovaPay.Models;
using Stripe;

namespace NovaPay.Services;

public class PaymentService : IPaymentService
{
    private readonly NovaPayDbContext _context;
    private readonly StripeSettings _stripeSettings;

    public PaymentService(NovaPayDbContext context, IOptions<StripeSettings> stripeSettings)
    {
        _context = context;
        _stripeSettings = stripeSettings.Value;
    }

    public async Task<(bool Success, string? ErrorMessage, CreatePaymentIntentResponse? Response)> CreatePaymentIntentAsync(Guid userId, decimal amount)
    {
        // 1. Validation: Prevent zero or negative deposit amounts
        if (amount <= 0)
        {
            return (false, "Deposit amount must be greater than zero.", null);
        }

        // 2. Find the user's wallet
        var user = await _context.Users
            .Include(u => u.Wallet)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user?.Wallet == null)
        {
            return (false, "User wallet not found.", null);
        }

        // 3. Convert decimal amount to cents (Stripe requires integers, no decimals!)
        // Example: 50.00 USD -> 5000 cents
        long amountInCents = (long)Math.Round(amount * 100);

        // 4. Configure the Stripe PaymentIntent parameters
        var options = new PaymentIntentCreateOptions
        {
            Amount = amountInCents,
            Currency = "usd",
            PaymentMethodTypes = new List<string> { "card" },
            
            // Critical: Metadata attaches our internal database IDs to the Stripe object.
            // When Stripe sends back a webhook later, we use these IDs to credit the correct wallet!
            Metadata = new Dictionary<string, string>
            {
                { "UserId", user.Id.ToString() },
                { "WalletId", user.Wallet.Id.ToString() },
                { "DepositAmount", amount.ToString("F2") }
            }
        };

        // 5. Call Stripe API to create the PaymentIntent
        var service = new PaymentIntentService();
        PaymentIntent paymentIntent = await service.CreateAsync(options);

        // 6. Return the client secret to the frontend
        return (true, null, new CreatePaymentIntentResponse
        {
            ClientSecret = paymentIntent.ClientSecret,
            PaymentIntentId = paymentIntent.Id,
            AmountInCents = paymentIntent.Amount
        });
    }

    public async Task<bool> HandleWebhookAsync(string jsonPayload, string stripeSignature)
    {
        Event stripeEvent;

        // 1. Cryptographic Signature Verification
        // Ensures the request genuinely came from Stripe and was not forged or altered by an attacker
        try
        {
            stripeEvent = EventUtility.ConstructEvent(
                jsonPayload,
                stripeSignature,
                _stripeSettings.WebhookSecret
            );
        }
        catch (StripeException)
        {
            // Invalid signature!
            return false;
        }

        // 2. Handle successful payment
        if (stripeEvent.Type == EventTypes.PaymentIntentSucceeded)
        {
            var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
            if (paymentIntent == null) return false;

            // 3. Read the Metadata we attached in Step 4
            if (!paymentIntent.Metadata.TryGetValue("WalletId", out var walletIdStr) ||
                !Guid.TryParse(walletIdStr, out var walletId))
            {
                return false;
            }

            // 4. Idempotency Check: Prevent duplicate credit if Stripe retries the webhook
            var existingTx = await _context.Transactions
                .FirstOrDefaultAsync(t => t.ReferenceId == paymentIntent.Id);

            if (existingTx != null)
            {
                // Already processed! Return true so Stripe stops retrying.
                return true;
            }

            // Convert cents back to decimal (5000 cents -> 50.00)
            decimal depositAmount = paymentIntent.Amount / 100m;

            // 5. Execute Double-Entry Ledger update inside an atomic database transaction
            using var dbTransaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.Id == walletId);
                if (wallet == null) return false;

                // Credit the user's wallet balance
                wallet.Balance += depositAmount;

                // Create master transaction record
                var transaction = new Transaction
                {
                    ReferenceId = paymentIntent.Id, // Store Stripe's pi_xxx as the unique reference
                    Type = TransactionType.TopUp,
                    Amount = depositAmount,
                    Status = TransactionStatus.Completed,
                    Description = $"Stripe Card Deposit ({paymentIntent.Id})"
                };

                _context.Transactions.Add(transaction);

                // Create double-entry credit record for the user's wallet
                var creditEntry = new LedgerEntry
                {
                    Transaction = transaction,
                    WalletId = wallet.Id,
                    Type = EntryType.Credit,
                    Amount = depositAmount,
                    BalanceAfter = wallet.Balance
                };

                _context.LedgerEntries.Add(creditEntry);

                await _context.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                return true;
            }
            catch
            {
                await dbTransaction.RollbackAsync();
                throw;
            }
        }

        return true;
    }
}