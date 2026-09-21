namespace NovaPay.Models;

public class TransferResponse
{
    public Guid TransactionId { get; set; }
    public string ReferenceId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string RecipientAccountNumber { get; set; } = string.Empty;
    public decimal RemainingBalance { get; set; }
    public DateTime CreatedAt { get; set; }
}