using DietApp.Domain.Entities;

namespace DietApp.Domain.Interfaces;

public interface IMealEntryItemRepository
{
    Task<MealEntryItem?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(MealEntryItem item, CancellationToken ct = default);
    Task DeleteAsync(MealEntryItem item, CancellationToken ct = default);
}
