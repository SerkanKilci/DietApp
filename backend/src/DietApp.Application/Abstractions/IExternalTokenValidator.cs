namespace DietApp.Application.Abstractions;

public record ExternalUserInfo(string ProviderUserId, string? Email, string? DisplayName);

public interface IExternalTokenValidator
{
    Task<ExternalUserInfo> ValidateAsync(string idToken, CancellationToken ct = default);
}
