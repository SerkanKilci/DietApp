using DietApp.Application.DTOs;

namespace DietApp.Application.Services;

public interface ISubscriptionService
{
    Task<bool> IsPremiumAsync(Guid userId, CancellationToken ct = default);
    Task<SubscriptionStatusDto> GetStatusAsync(Guid userId, CancellationToken ct = default);

    Task HandleWebhookEventAsync(
        Guid userId,
        string eventType,
        string? productId,
        string? entitlementId,
        DateTime? expiresAt,
        CancellationToken ct = default);
}
