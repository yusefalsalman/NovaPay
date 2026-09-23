namespace NovaPay.Models;

public class CreatePaymentIntentRequest
{
    // The amount in standard decimal currency (e.g. 50.00 for $50)
    public decimal Amount { get; set; }
}

public class CreatePaymentIntentResponse
{
    // Secret key sent to frontend to initialize Stripe Elements
    public string ClientSecret { get; set; } = string.Empty;
    
    // Stripe's unique identifier for this payment (e.g., pi_3Mtw...)
    public string PaymentIntentId { get; set; } = string.Empty;
    
    // Amount in cents (e.g., 5000)
    public long AmountInCents { get; set; }
}