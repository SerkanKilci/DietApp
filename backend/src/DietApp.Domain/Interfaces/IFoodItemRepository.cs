using DietApp.Domain.Entities;

namespace DietApp.Domain.Interfaces;

public interface IFoodItemRepository
{
    Task<FoodItem?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<(IReadOnlyList<FoodItem> Items, int TotalCount)> SearchAsync(
        string? query, Guid? createdByUserId, int page, int pageSize, CancellationToken ct = default);
    Task AddAsync(FoodItem foodItem, CancellationToken ct = default);
}
