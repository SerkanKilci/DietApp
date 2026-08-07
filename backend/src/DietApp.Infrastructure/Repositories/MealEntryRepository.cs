using DietApp.Domain.Entities;
using DietApp.Domain.Enums;
using DietApp.Domain.Interfaces;
using DietApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DietApp.Infrastructure.Repositories;

public class MealEntryRepository(DietAppDbContext dbContext) : IMealEntryRepository
{
    public async Task<MealEntry> GetOrCreateAsync(Guid userId, DateOnly logDate, MealType mealType, CancellationToken ct = default)
    {
        var existing = await dbContext.MealEntries
            .FirstOrDefaultAsync(e => e.UserId == userId && e.LogDate == logDate && e.MealType == mealType, ct);

        if (existing is not null)
        {
            return existing;
        }

        var entry = new MealEntry
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            LogDate = logDate,
            MealType = mealType,
            LoggedAt = DateTime.UtcNow,
        };

        dbContext.MealEntries.Add(entry);
        await dbContext.SaveChangesAsync(ct);
        return entry;
    }

    public async Task<IReadOnlyList<MealEntry>> GetByUserAndDateAsync(Guid userId, DateOnly logDate, CancellationToken ct = default) =>
        await dbContext.MealEntries
            .Where(e => e.UserId == userId && e.LogDate == logDate)
            .Include(e => e.Items)
            .ThenInclude(i => i.FoodItem)
            .ToListAsync(ct);
}
