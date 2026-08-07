using DietApp.Domain.Entities;

namespace DietApp.Domain.Interfaces;

public interface INutritionGoalRepository
{
    Task<NutritionGoal?> GetCurrentAsync(Guid userId, CancellationToken ct = default);
    Task AddAsync(NutritionGoal goal, CancellationToken ct = default);
}
