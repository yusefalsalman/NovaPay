using System.ComponentModel.DataAnnotations;

namespace NovaPay.Models;

public class TransferRequest
{
    [Required]
    public string RecipientIdentifier { get; set; } = string.Empty; // Account Number or Email

    [Required]
    [Range(0.01, 1000000, ErrorMessage = "Transfer amount must be greater than zero.")]
    public decimal Amount { get; set; }

    [MaxLength(200)]
    public string? Description { get; set; }
}