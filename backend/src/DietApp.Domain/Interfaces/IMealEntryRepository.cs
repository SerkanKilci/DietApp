using DietApp.Domain.Entities;
using DietApp.Domain.Enums;

namespace DietApp.Domain.Interfaces;

public interface IMealEntryRepository
{
    /// <summary>(userId, logDate, mealType) için mevcut satırı döner, yoksa yenisini oluşturup kaydeder.</summary>
    Task<MealEntry> GetOrCreateAsync(Guid userId, DateOnly logDate, MealType mealType, CancellationToken ct = default);

    Task<IReadOnlyList<MealEntry>> GetByUserAndDateAsync(Guid userId, DateOnly logDate, CancellationToken ct = default);
}
