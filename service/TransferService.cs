using Microsoft.EntityFrameworkCore;
using NovaPay.Data;
using NovaPay.Models;

namespace NovaPay.Services;

public class TransferService : ITransferService
{
    private readonly NovaPayDbContext _context;

    public TransferService(NovaPayDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, string? ErrorMessage, TransferResponse? Response)> TransferAsync(Guid senderUserId, TransferRequest request)
    {
        if (request.Amount <= 0)
        {
            return (false, "Transfer amount must be greater than zero.", null);
        }

        // 1. Start atomic database transaction
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            // 2. Load Sender's User & Wallet
            var sender = await _context.Users
                .Include(u => u.Wallet)
                .FirstOrDefaultAsync(u => u.Id == senderUserId);

            if (sender?.Wallet is null)
            {
                return (false, "Sender wallet not found.", null);
            }

            // 3. Check sufficient balance
            if (sender.Wallet.Balance < request.Amount)
            {
                return (false, "Insufficient balance.", null);
            }

            // 4. Find Recipient User & Wallet (by Account Number OR Email)
            var identifier = request.RecipientIdentifier.Trim().ToLower();
            var recipient = await _context.Users
                .Include(u => u.Wallet)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == identifier || (u.Wallet != null && u.Wallet.AccountNumber.ToLower() == identifier));

            if (recipient?.Wallet is null)
            {
                return (false, "Recipient wallet not found.", null);
            }

            // 5. Prevent transferring to own wallet
            if (sender.Wallet.Id == recipient.Wallet.Id)
            {
                return (false, "Cannot transfer funds to your own wallet.", null);
            }

            // 6. Update balances
            sender.Wallet.Balance -= request.Amount;
            recipient.Wallet.Balance += request.Amount;

            // 7. Create Master Transaction record
            var transferTx = new Transaction
            {
                Type = TransactionType.Transfer,
                Amount = request.Amount,
                Status = TransactionStatus.Completed,
                Description = request.Description ?? $"P2P Transfer to {recipient.FullName}"
            };

            _context.Transactions.Add(transferTx);

            // 8. Create Double-Entry Ledger Entries (Debit & Credit)
            var debitEntry = new LedgerEntry
            {
                Transaction = transferTx,
                WalletId = sender.Wallet.Id,
                Type = EntryType.Debit,
                Amount = request.Amount,
                BalanceAfter = sender.Wallet.Balance
            };

            var creditEntry = new LedgerEntry
            {
                Transaction = transferTx,
                WalletId = recipient.Wallet.Id,
                Type = EntryType.Credit,
                Amount = request.Amount,
                BalanceAfter = recipient.Wallet.Balance
            };

            _context.LedgerEntries.AddRange(debitEntry, creditEntry);

            // 9. Save changes to DB
            await _context.SaveChangesAsync();

            // 10. Commit transaction
            await transaction.CommitAsync();

            return (true, null, new TransferResponse
            {
                TransactionId = transferTx.Id,
                ReferenceId = transferTx.ReferenceId,
                Amount = request.Amount,
                RecipientAccountNumber = recipient.Wallet.AccountNumber,
                RemainingBalance = sender.Wallet.Balance,
                CreatedAt = transferTx.CreatedAt
            });
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync();
            return (false, "A concurrent transaction conflict occurred. Please try again.", null);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return (false, $"An unexpected error occurred: {ex.Message}", null);
        }
    }
}