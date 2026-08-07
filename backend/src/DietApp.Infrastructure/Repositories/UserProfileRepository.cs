using DietApp.Domain.Entities;
using DietApp.Domain.Interfaces;
using DietApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DietApp.Infrastructure.Repositories;

public class UserProfileRepository(DietAppDbContext dbContext) : IUserProfileRepository
{
    public Task<UserProfile?> GetByUserIdAsync(Guid userId, CancellationToken ct = default) =>
        dbContext.UserProfiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);

    public async Task UpsertAsync(UserProfile profile, CancellationToken ct = default)
    {
        // ProfileService, mevcut profili GetByUserIdAsync ile getirip mutasyona uğratıyorsa bu nesne
        // zaten Local'de (aynı DbContext tarafından izleniyor); yalnızca ilk onboarding'de yeni bir
        // nesne olarak gelir ve Add edilmesi gerekir.
        var alreadyTracked = dbContext.UserProfiles.Local.Any(p => p.UserId == profile.UserId);
        if (!alreadyTracked)
        {
            dbContext.UserProfiles.Add(profile);
        }

        await dbContext.SaveChangesAsync(ct);
    }
}
