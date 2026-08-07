using DietApp.Domain.Enums;

namespace DietApp.Application.DTOs;

public record RegisterRequest(string Email, string Password, string DisplayName);

public record LoginRequest(string Email, string Password);

public record ExternalLoginRequest(ExternalLoginProvider Provider, string IdToken);

public record RefreshRequest(string RefreshToken);

public record UserDto(Guid Id, string Email, string DisplayName, bool IsEmailVerified);

public record AuthResponse(
    string AccessToken,
    DateTime AccessTokenExpiresAt,
    string RefreshToken,
    DateTime RefreshTokenExpiresAt,
    UserDto User);
