using Microsoft.EntityFrameworkCore;
using NovaPay.Data;
using NovaPay.Models;

namespace NovaPay.Services;

public class TransactionService : ITransactionService
{
    private readonly NovaPayDbContext _context;

    public TransactionService(NovaPayDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, string? ErrorMessage, PagedResult<TransactionHistoryItemDto>? Data)> GetHistoryAsync(
        Guid userId, 
        TransactionQueryParameters parameters)
    {
        // 1. Find user's wallet
        var wallet = await _context.Wallets
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.UserId == userId);

        if (wallet == null)
        {
            return (false, "Wallet not found for this user.", null);
        }

        // 2. Build the base query on LedgerEntries for this wallet
        // AsNoTracking() is essential for read-only queries to maximize performance
        var query = _context.LedgerEntries
            .AsNoTracking()
            .Include(l => l.Transaction)
            .Where(l => l.WalletId == wallet.Id);

        // 3. Apply Filters dynamically
        if (parameters.Type.HasValue)
        {
            query = query.Where(l => l.Type == parameters.Type.Value);
        }

        if (parameters.TransactionType.HasValue)
        {
            query = query.Where(l => l.Transaction.Type == parameters.TransactionType.Value);
        }

        if (parameters.StartDate.HasValue)
        {
            // Set to beginning of the day in UTC
            var startUtc = DateTime.SpecifyKind(parameters.StartDate.Value.Date, DateTimeKind.Utc);
            query = query.Where(l => l.CreatedAt >= startUtc);
        }

        if (parameters.EndDate.HasValue)
        {
            // Set to end of the day in UTC (23:59:59.999)
            var endUtc = DateTime.SpecifyKind(parameters.EndDate.Value.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc);
            query = query.Where(l => l.CreatedAt <= endUtc);
        }

        // 4. Count total matching items before pagination
        var totalCount = await query.CountAsync();

        // 5. Apply Sorting & Pagination
        var items = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((parameters.PageNumber - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(l => new TransactionHistoryItemDto
            {
                LedgerEntryId = l.Id,
                TransactionId = l.TransactionId,
                ReferenceId = l.Transaction.ReferenceId,
                TransactionType = l.Transaction.Type,
                EntryType = l.Type,
                Amount = l.Amount,
                BalanceAfter = l.BalanceAfter,
                Description = l.Transaction.Description,
                Status = l.Transaction.Status,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync();

        var result = new PagedResult<TransactionHistoryItemDto>
        {
            Items = items,
            PageNumber = parameters.PageNumber,
            PageSize = parameters.PageSize,
            TotalCount = totalCount
        };

        return (true, null, result);
    }

    public async Task<(bool Success, string? ErrorMessage, TransactionHistoryItemDto? Data)> GetTransactionByIdAsync(Guid userId, Guid transactionId)
    {
        var wallet = await _context.Wallets
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.UserId == userId);

        if (wallet == null) return (false, "Wallet not found.", null);

        var entry = await _context.LedgerEntries
            .AsNoTracking()
            .Include(l => l.Transaction)
            .FirstOrDefaultAsync(l => l.WalletId == wallet.Id && l.TransactionId == transactionId);

        if (entry == null)
        {
            return (false, "Transaction not found or access denied.", null);
        }

        var dto = new TransactionHistoryItemDto
        {
            LedgerEntryId = entry.Id,
            TransactionId = entry.TransactionId,
            ReferenceId = entry.Transaction.ReferenceId,
            TransactionType = entry.Transaction.Type,
            EntryType = entry.Type,
            Amount = entry.Amount,
            BalanceAfter = entry.BalanceAfter,
            Description = entry.Transaction.Description,
            Status = entry.Transaction.Status,
            CreatedAt = entry.CreatedAt
        };

        return (true, null, dto);
    }
}