using DietApp.Application.DTOs;
using DietApp.Application.Exceptions;
using DietApp.Domain.Entities;
using DietApp.Domain.Enums;
using DietApp.Domain.Interfaces;

namespace DietApp.Application.Services;

public class FoodService(IFoodItemRepository foodItemRepository) : IFoodService
{
    public async Task<FoodSearchResult> SearchAsync(
        string? query, Guid requestingUserId, string languageCode, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var (items, totalCount) = await foodItemRepository.SearchAsync(query, requestingUserId, languageCode, page, pageSize, ct);

        var dtos = items.Select(f => new FoodListItemDto(
            f.Id, LocalizedName(f), f.Brand, f.Source, f.CaloriesPer100g, f.ProteinPer100g, f.CarbPer100g, f.FatPer100g));

        return new FoodSearchResult(dtos.ToList(), totalCount, page, pageSize);
    }

    public async Task<FoodDetailDto?> GetByIdAsync(Guid id, Guid requestingUserId, string languageCode, CancellationToken ct = default)
    {
        var food = await foodItemRepository.GetByIdAsync(id, languageCode, ct);
        if (food is null || IsPrivateToSomeoneElse(food, requestingUserId))
        {
            return null;
        }

        return MapToDetailDto(food);
    }

    public async Task<FoodDetailDto> CreateCustomFoodAsync(Guid userId, CreateCustomFoodRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException(ValidationErrorCode.FoodNameRequired, "Yemek adı gerekli.");
        }

        if (request.CaloriesPer100g < 0 || request.ProteinPer100g < 0 || request.CarbPer100g < 0 || request.FatPer100g < 0)
        {
            throw new ValidationException(ValidationErrorCode.FoodValuesNegative, "Besin değerleri negatif olamaz.");
        }

        var food = new FoodItem
        {
            Id = Guid.NewGuid(),
            Source = FoodSource.UserCreated,
            Name = request.Name.Trim(),
            Brand = request.Brand?.Trim(),
            CaloriesPer100g = request.CaloriesPer100g,
            ProteinPer100g = request.ProteinPer100g,
            CarbPer100g = request.CarbPer100g,
            FatPer100g = request.FatPer100g,
            FiberPer100g = request.FiberPer100g,
            SugarPer100g = request.SugarPer100g,
            SodiumMgPer100g = request.SodiumMgPer100g,
            CreatedByUserId = userId,
            IsVerified = false,
            CreatedAt = DateTime.UtcNow,
        };

        await foodItemRepository.AddAsync(food, ct);

        return MapToDetailDto(food);
    }

    private static bool IsPrivateToSomeoneElse(FoodItem food, Guid requestingUserId) =>
        food.Source == FoodSource.UserCreated && food.CreatedByUserId != requestingUserId;

    // Repository, istenen dile ait çeviriyi (varsa) FoodItem.Translations'a filtreli include ile
    // zaten yükledi — burada sadece var mı yok mu bakıp İngilizce Name'e düşüyoruz.
    private static string LocalizedName(FoodItem food) => food.Translations.FirstOrDefault()?.Name ?? food.Name;

    private static FoodDetailDto MapToDetailDto(FoodItem food) => new(
        food.Id,
        LocalizedName(food),
        food.Brand,
        food.Source,
        food.CaloriesPer100g,
        food.ProteinPer100g,
        food.CarbPer100g,
        food.FatPer100g,
        food.FiberPer100g,
        food.SugarPer100g,
        food.SodiumMgPer100g,
        food.Source == FoodSource.UserCreated,
        food.Micronutrients.Select(m => new FoodMicronutrientDto(m.NutrientCode, m.AmountPer100g, m.Unit)).ToList());
}
