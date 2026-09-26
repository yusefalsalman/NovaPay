using NovaPay.Models;

namespace NovaPay.Services;

public interface ITransactionService
{
    Task<(bool Success, string? ErrorMessage, PagedResult<TransactionHistoryItemDto>? Data)> GetHistoryAsync(
        Guid userId, 
        TransactionQueryParameters parameters
    );

    Task<(bool Success, string? ErrorMessage, TransactionHistoryItemDto? Data)> GetTransactionByIdAsync(
        Guid userId, 
        Guid transactionId
    );
}