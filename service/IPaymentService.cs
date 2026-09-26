using NovaPay.Models;

namespace NovaPay.Services;

public interface IPaymentService
{
    Task<(bool Success, string? ErrorMessage, CreatePaymentIntentResponse? Response)> CreatePaymentIntentAsync(Guid userId, decimal amount);
    Task<(bool Success, string? ErrorMessage)> ConfirmPaymentIntentAsync(string paymentIntentId);
    Task<bool> HandleWebhookAsync(string jsonPayload, string stripeSignature);
}