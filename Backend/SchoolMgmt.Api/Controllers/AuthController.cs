using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace SchoolMgmt.Api.Controllers;

public class LoginRequestDto
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
}

/// <summary>Demo credential store for issuing role-scoped JWTs; replace with the real identity/user module.</summary>
[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;

    private static readonly Dictionary<string, (string Password, string Role)> DemoUsers = new()
    {
        ["registrar"] = ("Registrar@123", "REGISTRAR"),
        ["admissions"] = ("Admissions@123", "ADMISSIONS_ADMIN"),
        ["admin"] = ("Admin@123", "SYSTEM_ADMIN"),
        ["teacher"] = ("Teacher@123", "TEACHER")
    };

    public AuthController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("login")]
    public ActionResult<LoginResponseDto> Login([FromBody] LoginRequestDto request)
    {
        if (!DemoUsers.TryGetValue(request.Username.ToLowerInvariant(), out var user) || user.Password != request.Password)
        {
            return Unauthorized(new { error = "Invalid username or password." });
        }

        var jwtKey = _configuration["Jwt:Key"]!;
        var expiryMinutes = int.Parse(_configuration["Jwt:ExpiryMinutes"] ?? "120");
        var expires = DateTime.UtcNow.AddMinutes(expiryMinutes);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.Name, request.Username),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var credentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)), SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: credentials);

        return Ok(new LoginResponseDto
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Role = user.Role,
            ExpiresAtUtc = expires
        });
    }
}
