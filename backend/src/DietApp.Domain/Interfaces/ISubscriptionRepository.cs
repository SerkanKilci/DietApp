using DietApp.Domain.Entities;

namespace DietApp.Domain.Interfaces;

public interface ISubscriptionRepository
{
    Task<Subscription?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);

    /// <summary>UserId'ye göre var olan satırı günceller, yoksa yeni satır ekler.</summary>
    Task UpsertAsync(Subscription subscription, CancellationToken ct = default);
}
