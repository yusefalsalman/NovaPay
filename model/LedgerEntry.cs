namespace NovaPay.Models;

public enum EntryType
{
    Debit,  // Money deducted
    Credit  // Money added
}

public class LedgerEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid TransactionId { get; set; }
    public Guid WalletId { get; set; }
    public EntryType Type { get; set; }
    public decimal Amount { get; set; }
    
    // Tracks the wallet's balance immediately after this entry (essential for PDF bank statements)
    public decimal BalanceAfter { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties (JsonIgnore prevents infinite serialization loops)
    public Transaction Transaction { get; set; } = null!;

    public Wallet Wallet { get; set; } = null!;
}