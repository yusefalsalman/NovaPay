using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaPay.Services;

namespace NovaPay.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class StatementsController : ControllerBase
{
    private readonly IStatementService _statementService;

    public StatementsController(IStatementService statementService)
    {
        _statementService = statementService;
    }

    /// <summary>
    /// GET /api/statements/download?startDate=2026-01-01&endDate=2026-02-01
    /// Generates and downloads the PDF account statement
    /// </summary>
    [HttpGet("download")]
    public async Task<IActionResult> DownloadStatement([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Invalid token." });
        }

        var (success, errorMessage, pdfBytes, fileName) = await _statementService.GenerateStatementPdfAsync(userId, startDate, endDate);

        if (!success || pdfBytes == null)
        {
            return BadRequest(new { message = errorMessage });
        }

        // Return the binary PDF stream to the client with application/pdf mime type
        return File(pdfBytes, "application/pdf", fileName);
    }
}