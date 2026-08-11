using DietApp.Application.DTOs;

namespace DietApp.Application.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, string? ipAddress, CancellationToken ct = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, string? ipAddress, CancellationToken ct = default);
    Task<AuthResponse> ExternalLoginAsync(ExternalLoginRequest request, string? ipAddress, CancellationToken ct = default);
    Task<AuthResponse> RefreshAsync(RefreshRequest request, string? ipAddress, CancellationToken ct = default);
    Task LogoutAsync(RefreshRequest request, CancellationToken ct = default);
    Task DeleteAccountAsync(Guid userId, CancellationToken ct = default);
}
