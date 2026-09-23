namespace NovaPay.Models;

public class Wallet
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string AccountNumber { get; set; } = string.Empty;
    public decimal Balance { get; set; } = 0.00m;
    public string Currency { get; set; } = "usd";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public uint Version { get; set; }

    // Navigation Properties
    public User? User { get; set; }
    public ICollection<LedgerEntry> LedgerEntries { get; set; } = new List<LedgerEntry>();
}