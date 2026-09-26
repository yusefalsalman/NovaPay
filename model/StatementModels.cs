namespace NovaPay.Models;

public class StatementReportModel
{
    public string AccountNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string Currency { get; set; } = "USD";
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    // Financial Summary
    public decimal OpeningBalance { get; set; }
    public decimal TotalDeposits { get; set; } // Total Credits
    public decimal TotalWithdrawals { get; set; } // Total Debits
    public decimal ClosingBalance { get; set; }

    // Transaction rows
    public List<StatementItemModel> Items { get; set; } = new();
}

public class StatementItemModel
{
    public DateTime Date { get; set; }
    public string ReferenceId { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "Debit" or "Credit"
    public decimal Amount { get; set; }
    public decimal BalanceAfter { get; set; }
}