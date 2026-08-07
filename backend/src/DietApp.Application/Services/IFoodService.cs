using DietApp.Application.DTOs;

namespace DietApp.Application.Services;

public interface IFoodService
{
    Task<FoodSearchResult> SearchAsync(string? query, Guid requestingUserId, int page, int pageSize, CancellationToken ct = default);
    Task<FoodDetailDto?> GetByIdAsync(Guid id, Guid requestingUserId, CancellationToken ct = default);
    Task<FoodDetailDto> CreateCustomFoodAsync(Guid userId, CreateCustomFoodRequest request, CancellationToken ct = default);
}
