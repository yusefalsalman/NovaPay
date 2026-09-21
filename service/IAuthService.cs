using NovaPay.Models;

namespace NovaPay.Services;

public interface IAuthService
{
    Task<(bool Success, string? ErrorMessage, AuthResponse? Response)> RegisterAsync(RegisterRequest request);
    Task<(bool Success, string? ErrorMessage, AuthResponse? Response)> LoginAsync(LoginRequest request);
}