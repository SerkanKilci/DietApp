using DietApp.Application.Abstractions;
using DietApp.Application.DTOs;
using DietApp.Application.Exceptions;
using DietApp.Domain.Entities;
using DietApp.Domain.Enums;
using DietApp.Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace DietApp.Application.Services;

public class AuthService(
    IUserRepository userRepository,
    IRefreshTokenRepository refreshTokenRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService,
    [FromKeyedServices(ExternalLoginProvider.Google)] IExternalTokenValidator googleValidator,
    [FromKeyedServices(ExternalLoginProvider.Apple)] IExternalTokenValidator appleValidator) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, string? ipAddress, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existing = await userRepository.GetByEmailAsync(normalizedEmail, ct);
        if (existing is not null)
        {
            throw new AuthException(AuthErrorCode.EmailAlreadyRegistered, "Bu email adresi zaten kayıtlı.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            PasswordHash = passwordHasher.Hash(request.Password),
            DisplayName = request.DisplayName,
            IsEmailVerified = false,
            CreatedAt = DateTime.UtcNow,
        };

        await userRepository.AddAsync(user, ct);

        return await IssueTokensAsync(user, ipAddress, ct);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await userRepository.GetByEmailAsync(normalizedEmail, ct);

        if (user?.PasswordHash is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new AuthException(AuthErrorCode.InvalidCredentials, "Email veya şifre hatalı.");
        }

        return await IssueTokensAsync(user, ipAddress, ct);
    }

    public async Task<AuthResponse> ExternalLoginAsync(ExternalLoginRequest request, string? ipAddress, CancellationToken ct = default)
    {
        var validator = request.Provider switch
        {
            ExternalLoginProvider.Google => googleValidator,
            ExternalLoginProvider.Apple => appleValidator,
            _ => throw new AuthException(AuthErrorCode.InvalidExternalToken, "Desteklenmeyen sağlayıcı."),
        };

        ExternalUserInfo info;
        try
        {
            info = await validator.ValidateAsync(request.IdToken, ct);
        }
        catch (Exception ex) when (ex is not AuthException)
        {
            throw new AuthException(AuthErrorCode.InvalidExternalToken, "Sağlayıcı token'ı doğrulanamadı.");
        }

        var user = await userRepository.GetByExternalLoginAsync(request.Provider, info.ProviderUserId, ct);

        if (user is null && !string.IsNullOrWhiteSpace(info.Email))
        {
            // Aynı email ile daha önce başka bir yöntemle (örn. email/şifre) kayıt olunmuşsa hesapları birleştir.
            user = await userRepository.GetByEmailAsync(info.Email.Trim().ToLowerInvariant(), ct);
        }

        if (user is null)
        {
            if (string.IsNullOrWhiteSpace(info.Email))
            {
                // Apple, email adresini yalnızca kullanıcının ilk yetkilendirmesinde döner;
                // mobil taraf bu değeri ilk girişte yakalayıp bize iletmelidir.
                throw new AuthException(AuthErrorCode.InvalidExternalToken, "Hesap oluşturmak için email bilgisi gerekli.");
            }

            user = new User
            {
                Id = Guid.NewGuid(),
                Email = info.Email.Trim().ToLowerInvariant(),
                PasswordHash = null,
                DisplayName = info.DisplayName ?? info.Email,
                IsEmailVerified = true,
                CreatedAt = DateTime.UtcNow,
            };

            await userRepository.AddAsync(user, ct);
        }

        var alreadyLinked = user.ExternalLogins.Any(e => e.Provider == request.Provider && e.ProviderUserId == info.ProviderUserId);
        if (!alreadyLinked)
        {
            await userRepository.AddExternalLoginAsync(new ExternalLogin
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Provider = request.Provider,
                ProviderUserId = info.ProviderUserId,
                CreatedAt = DateTime.UtcNow,
            }, ct);
        }

        return await IssueTokensAsync(user, ipAddress, ct);
    }

    public async Task<AuthResponse> RefreshAsync(RefreshRequest request, string? ipAddress, CancellationToken ct = default)
    {
        var tokenHash = jwtTokenService.HashRefreshToken(request.RefreshToken);
        var existingToken = await refreshTokenRepository.GetByTokenHashAsync(tokenHash, ct);

        if (existingToken is null || !existingToken.IsActive)
        {
            throw new AuthException(AuthErrorCode.InvalidRefreshToken, "Refresh token geçersiz veya süresi dolmuş.");
        }

        var user = await userRepository.GetByIdAsync(existingToken.UserId, ct)
            ?? throw new AuthException(AuthErrorCode.InvalidRefreshToken, "Kullanıcı bulunamadı.");

        await refreshTokenRepository.RevokeAsync(existingToken, ct);

        return await IssueTokensAsync(user, ipAddress, ct);
    }

    public async Task LogoutAsync(RefreshRequest request, CancellationToken ct = default)
    {
        var tokenHash = jwtTokenService.HashRefreshToken(request.RefreshToken);
        var existingToken = await refreshTokenRepository.GetByTokenHashAsync(tokenHash, ct);

        if (existingToken is { IsActive: true })
        {
            await refreshTokenRepository.RevokeAsync(existingToken, ct);
        }
    }

    // App Store (Guideline 5.1.1v) ve Play Store, hesap oluşturmayı destekleyen uygulamalarda
    // uygulama içinden hesap silmeyi de zorunlu tutuyor.
    public async Task DeleteAccountAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await userRepository.GetByIdAsync(userId, ct);
        if (user is not null)
        {
            await userRepository.DeleteAsync(user, ct);
        }
    }

    private async Task<AuthResponse> IssueTokensAsync(User user, string? ipAddress, CancellationToken ct)
    {
        var accessToken = jwtTokenService.GenerateAccessToken(user);
        var refreshTokenPlain = jwtTokenService.GenerateRefreshToken();
        var refreshTokenExpiresAt = DateTime.UtcNow.Add(jwtTokenService.RefreshTokenLifetime);

        await refreshTokenRepository.AddAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = jwtTokenService.HashRefreshToken(refreshTokenPlain),
            ExpiresAt = refreshTokenExpiresAt,
            CreatedAt = DateTime.UtcNow,
            CreatedByIp = ipAddress,
        }, ct);

        return new AuthResponse(
            accessToken.Token,
            accessToken.ExpiresAt,
            refreshTokenPlain,
            refreshTokenExpiresAt,
            new UserDto(user.Id, user.Email, user.DisplayName, user.IsEmailVerified));
    }
}
