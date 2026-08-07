using DietApp.Domain.Entities;
using DietApp.Domain.Interfaces;
using DietApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DietApp.Infrastructure.Repositories;

public class NutritionGoalRepository(DietAppDbContext dbContext) : INutritionGoalRepository
{
    public Task<NutritionGoal?> GetCurrentAsync(Guid userId, CancellationToken ct = default) =>
        dbContext.NutritionGoals
            .Where(g => g.UserId == userId)
            .OrderByDescending(g => g.EffectiveFrom)
            .FirstOrDefaultAsync(ct);

    public async Task AddAsync(NutritionGoal goal, CancellationToken ct = default)
    {
        dbContext.NutritionGoals.Add(goal);
        await dbContext.SaveChangesAsync(ct);
    }
}
