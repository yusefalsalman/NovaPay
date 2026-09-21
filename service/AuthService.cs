using NovaPay.Models;
using NovaPay.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;

namespace NovaPay.Services;

public class AuthService : IAuthService
{
    private readonly NovaPayDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(NovaPayDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<(bool Success, string? ErrorMessage, AuthResponse? Response)> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower());
        if (existingUser)
        {
            return (false, "An account with this email already exists.", null);
        }

        // 2. Hash password securely using BCrypt (NEVER store plain-text passwords)
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // 3. Create User entity
        var user = new User
        {
            FullName = request.FullName,
            Email = request.Email.ToLower(),
            PasswordHash = passwordHash,
            Wallet = new Wallet()
            {
                AccountNumber =  $"NP-2026-{Guid.NewGuid().ToString("N")[..6].ToUpper()}",
                Balance = 0.00m
            }
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // 4. Generate JWT Token
        var token = GenerateJwtToken(user);

        return (true, null, new AuthResponse
        {
            Token = token,
            Email = user.Email,
            FullName = user.FullName,
            AccountNumber = user.Wallet.AccountNumber,
            Balance = user.Wallet.Balance
        });
    }
    public async Task<(bool Success, string? ErrorMessage, AuthResponse? Response)> LoginAsync(LoginRequest request)
    {
        // 1. Find user by email
        var user = await _context.Users
        .Include(u => u.Wallet)
        .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());
        
        if (user is null)
        {
            return (false, "Invalid email or password.", null);
        }

        // 2. Verify hashed password
        var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return (false, "Invalid email or password.", null);
        }

        // 3. Generate JWT Token
        var token = GenerateJwtToken(user);

        return (true, null, new AuthResponse
        {
            Token = token,
            Email = user.Email,
            FullName = user.FullName,
            AccountNumber = user.Wallet?.AccountNumber ?? string.Empty,
            Balance = user.Wallet?.Balance ?? 0.00m
        });
    }

    private string GenerateJwtToken(User user)
{
    var jwtSettings = _configuration.GetSection("Jwt");
    var keyStr = jwtSettings["Key"] ?? "ThisIsASecretKeyForBookingAppThatIsAtLeast32BytesLong!";
    var secretKey = Encoding.UTF8.GetBytes(keyStr);
    var durationMinutes = double.TryParse(jwtSettings["DurationInMinutes"], out var d) ? d : 60;
    var issuer = jwtSettings["Issuer"] ?? "NovaPay";
    var audience = jwtSettings["Audience"] ?? "NovaPay";

    // Claims: Data embedded securely inside the token that React & ASP.NET can read
    var claims = new List<Claim>
    {
        new(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new(ClaimTypes.Email, user.Email),
        new(ClaimTypes.Name, user.FullName),
    };

    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(claims),
        Expires = DateTime.UtcNow.AddMinutes(durationMinutes),
        Issuer = issuer,
        Audience = audience,
        SigningCredentials = new SigningCredentials(
            new SymmetricSecurityKey(secretKey),
            SecurityAlgorithms.HmacSha256Signature)
    };

    var tokenHandler = new JwtSecurityTokenHandler();
    var token = tokenHandler.CreateToken(tokenDescriptor);

    return tokenHandler.WriteToken(token);
}
}