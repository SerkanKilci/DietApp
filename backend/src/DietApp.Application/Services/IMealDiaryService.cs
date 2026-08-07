using DietApp.Application.DTOs;

namespace DietApp.Application.Services;

public interface IMealDiaryService
{
    Task<MealEntryItemDto> AddItemAsync(Guid userId, AddMealItemRequest request, CancellationToken ct = default);
    Task<DailySummaryDto> GetDailySummaryAsync(Guid userId, DateOnly logDate, CancellationToken ct = default);
    Task DeleteItemAsync(Guid userId, Guid itemId, CancellationToken ct = default);
}
