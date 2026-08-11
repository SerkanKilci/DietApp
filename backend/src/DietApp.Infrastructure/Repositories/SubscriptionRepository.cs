using DietApp.Domain.Entities;
using DietApp.Domain.Interfaces;
using DietApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DietApp.Infrastructure.Repositories;

public class SubscriptionRepository(DietAppDbContext dbContext) : ISubscriptionRepository
{
    public Task<Subscription?> GetByUserIdAsync(Guid userId, CancellationToken ct = default) =>
        dbContext.Subscriptions.FirstOrDefaultAsync(s => s.UserId == userId, ct);

    public async Task UpsertAsync(Subscription subscription, CancellationToken ct = default)
    {
        var existing = await dbContext.Subscriptions.FirstOrDefaultAsync(s => s.UserId == subscription.UserId, ct);
        if (existing is null)
        {
            dbContext.Subscriptions.Add(subscription);
        }
        else
        {
            existing.ProductId = subscription.ProductId;
            existing.EntitlementId = subscription.EntitlementId;
            existing.ExpiresAt = subscription.ExpiresAt;
            existing.LastEventType = subscription.LastEventType;
            existing.UpdatedAt = subscription.UpdatedAt;
        }

        await dbContext.SaveChangesAsync(ct);
    }
}
