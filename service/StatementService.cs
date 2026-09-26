using Microsoft.EntityFrameworkCore;
using NovaPay.Data;
using NovaPay.Models;
using QuestPDF.Fluent;

namespace NovaPay.Services;

public class StatementService : IStatementService
{
    private readonly NovaPayDbContext _context;

    public StatementService(NovaPayDbContext context)
    {
        _context = context;
    }

    public async Task<(bool Success, string? ErrorMessage, byte[]? PdfBytes, string? FileName)> GenerateStatementPdfAsync(
        Guid userId, 
        DateTime? startDate, 
        DateTime? endDate)
    {
        // 1. Fetch user & wallet details
        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.Wallet)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user?.Wallet == null)
        {
            return (false, "User wallet not found.", null, null);
        }

        // Default: Last 30 days if not specified
        var end = endDate.HasValue 
            ? DateTime.SpecifyKind(endDate.Value.Date.AddDays(1).AddTicks(-1), DateTimeKind.Utc) 
            : DateTime.UtcNow;

        var start = startDate.HasValue 
            ? DateTime.SpecifyKind(startDate.Value.Date, DateTimeKind.Utc) 
            : end.AddDays(-30);

        // 2. Fetch all ledger entries in this period
        var entries = await _context.LedgerEntries
            .AsNoTracking()
            .Include(l => l.Transaction)
            .Where(l => l.WalletId == user.Wallet.Id && l.CreatedAt >= start && l.CreatedAt <= end)
            .OrderBy(l => l.CreatedAt)
            .ToListAsync();

        // 3. Calculate Opening Balance:
        // Opening balance is the balance right before the 'start' date.
        // We find the last ledger entry before 'start'
        var lastEntryBeforePeriod = await _context.LedgerEntries
            .AsNoTracking()
            .Where(l => l.WalletId == user.Wallet.Id && l.CreatedAt < start)
            .OrderByDescending(l => l.CreatedAt)
            .FirstOrDefaultAsync();

        decimal openingBalance = lastEntryBeforePeriod?.BalanceAfter ?? 0.00m;

        // 4. Calculate Total Credits (Inflow) and Total Debits (Outflow)
        decimal totalDeposits = entries.Where(e => e.Type == EntryType.Credit).Sum(e => e.Amount);
        decimal totalWithdrawals = entries.Where(e => e.Type == EntryType.Debit).Sum(e => e.Amount);
        
        // Closing balance is the balance after the last transaction in the period, 
        // or opening balance if no transactions occurred
        decimal closingBalance = entries.Any() ? entries.Last().BalanceAfter : openingBalance;

        // 5. Map to Report Model
        var reportModel = new StatementReportModel
        {
            AccountNumber = user.Wallet.AccountNumber,
            CustomerName = user.FullName,
            CustomerEmail = user.Email,
            Currency = user.Wallet.Currency,
            StartDate = start,
            EndDate = end,
            OpeningBalance = openingBalance,
            TotalDeposits = totalDeposits,
            TotalWithdrawals = totalWithdrawals,
            ClosingBalance = closingBalance,
            Items = entries.Select(e => new StatementItemModel
            {
                Date = e.CreatedAt,
                ReferenceId = e.Transaction.ReferenceId,
                Description = e.Transaction.Description ?? e.Transaction.Type.ToString(),
                Type = e.Type.ToString(),
                Amount = e.Amount,
                BalanceAfter = e.BalanceAfter
            }).ToList()
        };

        // 6. Generate PDF Bytes using QuestPDF
        var document = new StatementDocument(reportModel);
        byte[] pdfBytes = document.GeneratePdf();

        string fileName = $"NovaPay_Statement_{user.Wallet.AccountNumber}_{start:yyyyMMdd}_{end:yyyyMMdd}.pdf";

        return (true, null, pdfBytes, fileName);
    }
}