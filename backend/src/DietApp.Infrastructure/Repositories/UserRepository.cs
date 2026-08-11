using DietApp.Domain.Entities;
using DietApp.Domain.Enums;
using DietApp.Domain.Interfaces;
using DietApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DietApp.Infrastructure.Repositories;

public class UserRepository(DietAppDbContext dbContext) : IUserRepository
{
    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        dbContext.Users.Include(u => u.ExternalLogins).FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default) =>
        dbContext.Users.Include(u => u.ExternalLogins).FirstOrDefaultAsync(u => u.Email == email, ct);

    public Task<User?> GetByExternalLoginAsync(ExternalLoginProvider provider, string providerUserId, CancellationToken ct = default) =>
        dbContext.Users
            .Include(u => u.ExternalLogins)
            .FirstOrDefaultAsync(u => u.ExternalLogins.Any(e => e.Provider == provider && e.ProviderUserId == providerUserId), ct);

    public async Task AddAsync(User user, CancellationToken ct = default)
    {
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(ct);
    }

    public async Task AddExternalLoginAsync(ExternalLogin externalLogin, CancellationToken ct = default)
    {
        dbContext.ExternalLogins.Add(externalLogin);
        await dbContext.SaveChangesAsync(ct);
    }

    // Kullanıcıya ait tüm ilişkili veriler (profil, hedefler, günlük, AI analizleri, refresh token'lar,
    // external login'ler) FK'lerde ON DELETE CASCADE ile yapılandırıldığından tek bir Remove yeterli
    // (bkz. UserConfiguration/UserProfileConfiguration/NutritionGoalConfiguration/MealEntryConfiguration/
    // AiPlateAnalysisConfiguration). Kullanıcının özel yemekleri (FoodItems.CreatedByUserId) SetNull ile
    // sahipsiz kalır ama private oldukları için artık kimseye görünmez.
    public async Task DeleteAsync(User user, CancellationToken ct = default)
    {
        dbContext.Users.Remove(user);
        await dbContext.SaveChangesAsync(ct);
    }
}
