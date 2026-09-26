namespace NovaPay.Models;

// 1. Query parameters sent by the frontend
public class TransactionQueryParameters
{
    private const int MaxPageSize = 50;
    private int _pageSize = 10;

    public int PageNumber { get; set; } = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : (value < 1 ? 10 : value);
    }

    public EntryType? Type { get; set; } // Debit or Credit (Optional)
    public TransactionType? TransactionType { get; set; } // Transfer or TopUp (Optional)
    public DateTime? StartDate { get; set; } // Optional
    public DateTime? EndDate { get; set; }   // Optional
}

// 2. Individual transaction item in the history list
public class TransactionHistoryItemDto
{
    public Guid LedgerEntryId { get; set; }
    public Guid TransactionId { get; set; }
    public string ReferenceId { get; set; } = string.Empty;
    public TransactionType TransactionType { get; set; }
    public EntryType EntryType { get; set; } // Debit or Credit
    public decimal Amount { get; set; }
    public decimal BalanceAfter { get; set; }
    public string? Description { get; set; }
    public TransactionStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

// 3. Generic Paginated List container
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}