using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaPay.Models;
using NovaPay.Services;

namespace NovaPay.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionsController(ITransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    /// <summary>
    /// GET /api/transactions?pageNumber=1&pageSize=10&type=Credit&startDate=2026-01-01
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetHistory([FromQuery] TransactionQueryParameters parameters)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Invalid token." });
        }

        var (success, errorMessage, data) = await _transactionService.GetHistoryAsync(userId, parameters);

        if (!success)
        {
            return BadRequest(new { message = errorMessage });
        }

        return Ok(data);
    }

    /// <summary>
    /// GET /api/transactions/{id}
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Invalid token." });
        }

        var (success, errorMessage, data) = await _transactionService.GetTransactionByIdAsync(userId, id);

        if (!success)
        {
            return NotFound(new { message = errorMessage });
        }

        return Ok(data);
    }
}