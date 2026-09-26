namespace NovaPay.Services;

public interface IStatementService
{
    Task<(bool Success, string? ErrorMessage, byte[]? PdfBytes, string? FileName)> GenerateStatementPdfAsync(
        Guid userId, 
        DateTime? startDate, 
        DateTime? endDate
    );
}