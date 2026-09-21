using NovaPay.Models;
namespace NovaPay.Services;
public interface ITransferService
{
    Task<(bool Success, string? ErrorMessage, TransferResponse? Response)> TransferAsync(Guid senderUserId, TransferRequest request);
}