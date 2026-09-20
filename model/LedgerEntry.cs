namespace NovaPay.Models;

public enum EntryType
{
    Debit,
    Credit,
}

public class LedgerEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TransactionId { get; set; }
    public Guid WalletId { get; set; }
    public EntryType Type { get; set; }
    public decimal Amount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public Transaction? Transaction { get; set; }
    public Wallet? Wallet { get; set; }
}