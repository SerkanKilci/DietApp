using DietApp.Domain.Enums;

namespace DietApp.Application.DTOs;

public record AddMealItemRequest(DateOnly LogDate, MealType MealType, Guid FoodItemId, decimal QuantityG);

public record MealEntryItemDto(
    Guid Id,
    Guid? FoodItemId,
    string FoodName,
    decimal QuantityG,
    decimal CaloriesTotal,
    decimal ProteinTotal,
    decimal CarbTotal,
    decimal FatTotal);

public record MealGroupDto(MealType MealType, IReadOnlyList<MealEntryItemDto> Items, decimal TotalCalories);

public record DailySummaryDto(
    DateOnly LogDate,
    int CalorieGoal,
    int ProteinGoal,
    int CarbGoal,
    int FatGoal,
    decimal ConsumedCalories,
    decimal ConsumedProtein,
    decimal ConsumedCarb,
    decimal ConsumedFat,
    decimal RemainingCalories,
    IReadOnlyList<MealGroupDto> Meals);
