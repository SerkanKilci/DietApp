using DietApp.Domain.Entities;

namespace DietApp.Application.Abstractions;

public record AccessTokenResult(string Token, DateTime ExpiresAt);

public interface IJwtTokenService
{
    AccessTokenResult GenerateAccessToken(User user);
    string GenerateRefreshToken();
    string HashRefreshToken(string refreshToken);
    TimeSpan RefreshTokenLifetime { get; }
}
