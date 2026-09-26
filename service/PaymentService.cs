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
        if (amount <= 0)
        {
            return (false, "Deposit amount must be greater than zero.", null);
        }

        var user = await _context.Users
            .Include(u => u.Wallet)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user?.Wallet == null)
        {
            return (false, "User wallet not found.", null);
        }

        long amountInCents = (long)Math.Round(amount * 100);

        var options = new PaymentIntentCreateOptions
        {
            Amount = amountInCents,
            Currency = "usd",
            PaymentMethodTypes = new List<string> { "card" },
            Metadata = new Dictionary<string, string>
            {
                { "UserId", user.Id.ToString() },
                { "WalletId", user.Wallet.Id.ToString() },
                { "DepositAmount", amount.ToString("F2") }
            }
        };

        var service = new PaymentIntentService();
        PaymentIntent paymentIntent = await service.CreateAsync(options);

        return (true, null, new CreatePaymentIntentResponse
        {
            ClientSecret = paymentIntent.ClientSecret,
            PaymentIntentId = paymentIntent.Id,
            AmountInCents = paymentIntent.Amount
        });
    }

    public async Task<(bool Success, string? ErrorMessage)> ConfirmPaymentIntentAsync(string paymentIntentId)
    {
        try
        {
            var service = new PaymentIntentService();
            var options = new PaymentIntentConfirmOptions
            {
                PaymentMethod = "pm_card_visa", // Stripe's official automated test card
                ReturnUrl = "http://localhost:5173",
            };

            var intent = await service.ConfirmAsync(paymentIntentId, options);

            if (intent.Status == "succeeded")
            {
                await CreditWalletForPaymentIntentAsync(intent);
                return (true, null);
            }

            return (false, $"Payment status: {intent.Status}");
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }

    public async Task<bool> HandleWebhookAsync(string jsonPayload, string stripeSignature)
    {
        Event stripeEvent;

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
            return false;
        }

        if (stripeEvent.Type == EventTypes.PaymentIntentSucceeded)
        {
            var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
            if (paymentIntent == null) return false;

            return await CreditWalletForPaymentIntentAsync(paymentIntent);
        }

        return true;
    }

    private async Task<bool> CreditWalletForPaymentIntentAsync(PaymentIntent paymentIntent)
    {
        if (!paymentIntent.Metadata.TryGetValue("WalletId", out var walletIdStr) ||
            !Guid.TryParse(walletIdStr, out var walletId))
        {
            return false;
        }

        // Idempotency Check: Prevent duplicate credit if both webhook and client confirm run
        var existingTx = await _context.Transactions
            .FirstOrDefaultAsync(t => t.ReferenceId == paymentIntent.Id);

        if (existingTx != null)
        {
            return true;
        }

        decimal depositAmount = paymentIntent.Amount / 100m;

        using var dbTransaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.Id == walletId);
            if (wallet == null) return false;

            wallet.Balance += depositAmount;

            var transaction = new Transaction
            {
                ReferenceId = paymentIntent.Id,
                Type = TransactionType.TopUp,
                Amount = depositAmount,
                Status = TransactionStatus.Completed,
                Description = $"Stripe Card Deposit ({paymentIntent.Id})"
            };

            _context.Transactions.Add(transaction);

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
}