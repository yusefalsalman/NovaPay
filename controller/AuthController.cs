using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NovaPay.Data;
using NovaPay.Models;
using NovaPay.Services;

namespace NovaPay.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly NovaPayDbContext _context;

    public AuthController(IAuthService authService, NovaPayDbContext context)
    {
        _authService = authService;
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);

        if (!result.Success)
        {
            return BadRequest(new { message = result.ErrorMessage });
        }

        return Ok(result.Response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);

        if (!result.Success)
        {
            return Unauthorized(new { message = result.ErrorMessage });
        }

        return Ok(result.Response);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                     ?? User.FindFirst("sub")?.Value
                     ?? User.FindFirst("id")?.Value;

        if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(new { message = "Invalid user token claims." });
        }

        var user = await _context.Users
            .Include(u => u.Wallet)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound(new { message = "User not found in system." });
        }

        // Return both flat & nested wallet properties to guarantee compatibility with all clients
        var accountNumber = user.Wallet?.AccountNumber ?? "NP-2026-000000";
        var balance = user.Wallet?.Balance ?? 0.00m;
        var currency = user.Wallet?.Currency ?? "USD";

        return Ok(new
        {
            id = user.Id,
            fullName = user.FullName,
            email = user.Email,
            accountNumber = accountNumber,
            balance = balance,
            currency = currency,
            wallet = new
            {
                id = user.Wallet?.Id,
                accountNumber = accountNumber,
                balance = balance,
                currency = currency
            }
        });
    }
}