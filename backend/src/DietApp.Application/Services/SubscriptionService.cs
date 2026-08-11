using DietApp.Application.DTOs;
using DietApp.Domain.Entities;
using DietApp.Domain.Interfaces;

namespace DietApp.Application.Services;

public class SubscriptionService(ISubscriptionRepository subscriptionRepository) : ISubscriptionService
{
    public async Task<bool> IsPremiumAsync(Guid userId, CancellationToken ct = default)
    {
        var subscription = await subscriptionRepository.GetByUserIdAsync(userId, ct);
        return IsCurrentlyActive(subscription);
    }

    public async Task<SubscriptionStatusDto> GetStatusAsync(Guid userId, CancellationToken ct = default)
    {
        var subscription = await subscriptionRepository.GetByUserIdAsync(userId, ct);
        return new SubscriptionStatusDto(IsCurrentlyActive(subscription), subscription?.ExpiresAt);
    }

    public Task HandleWebhookEventAsync(
        Guid userId, string eventType, string? productId, string? entitlementId, DateTime? expiresAt, CancellationToken ct = default) =>
        subscriptionRepository.UpsertAsync(new Subscription
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProductId = productId ?? "unknown",
            EntitlementId = entitlementId ?? "unknown",
            ExpiresAt = expiresAt,
            LastEventType = eventType,
            UpdatedAt = DateTime.UtcNow,
        }, ct);

    // Tek kural: RevenueCat'in son bildirdiği ExpiresAt gelecekte mi? CANCELLATION event'i (kullanıcı
    // yenilemeyi kapattı) ExpiresAt'i değiştirmez, bu yüzden dönem sonuna kadar erişim devam eder.
    private static bool IsCurrentlyActive(Subscription? subscription) =>
        subscription is { ExpiresAt: not null } && subscription.ExpiresAt.Value > DateTime.UtcNow;
}
