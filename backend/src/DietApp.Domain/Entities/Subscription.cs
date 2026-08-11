namespace DietApp.Domain.Entities;

// Kullanıcı başına tek satır (upsert) — RevenueCat webhook'undan gelen son event'in izdüşümü.
// Erişim kontrolü tek bir kurala dayanır: ExpiresAt gelecekte mi? (bkz. SubscriptionService.IsPremiumAsync)
// CANCELLATION event'i dönem sonuna kadar erişimi kesmez (kullanıcı yenilemeyi kapattı ama süresi dolmadı),
// bu yüzden ayrı bir "IsActive" alanı yerine sadece ExpiresAt'e güveniyoruz.
public class Subscription
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public string ProductId { get; set; } = default!;
    public string EntitlementId { get; set; } = default!;
    public DateTime? ExpiresAt { get; set; }

    /// <summary>Denetim/debug için RevenueCat'in son gönderdiği event tipi (ör. "INITIAL_PURCHASE", "RENEWAL").</summary>
    public string LastEventType { get; set; } = default!;
    public DateTime UpdatedAt { get; set; }
}
