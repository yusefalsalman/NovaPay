namespace NovaPay.Models;

public enum TransactionType
{
    TopUp,
    Transfer
}

public enum TransactionStatus
{
    Pending,
    Completed,
    Failed
}

public class Transaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ReferenceId { get; set; } = Guid.NewGuid().ToString("N");
    public TransactionType Type { get; set; }
    public decimal Amount { get; set; }
    public TransactionStatus Status { get; set; } = TransactionStatus.Pending;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public ICollection<LedgerEntry> LedgerEntries { get; set; } = new List<LedgerEntry>();
}