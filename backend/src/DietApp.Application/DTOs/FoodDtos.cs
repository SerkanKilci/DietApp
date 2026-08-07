using DietApp.Domain.Enums;

namespace DietApp.Application.DTOs;

public record FoodListItemDto(
    Guid Id,
    string Name,
    string? Brand,
    FoodSource Source,
    decimal CaloriesPer100g,
    decimal ProteinPer100g,
    decimal CarbPer100g,
    decimal FatPer100g);

public record FoodMicronutrientDto(string NutrientCode, decimal AmountPer100g, string Unit);

public record FoodDetailDto(
    Guid Id,
    string Name,
    string? Brand,
    FoodSource Source,
    decimal CaloriesPer100g,
    decimal ProteinPer100g,
    decimal CarbPer100g,
    decimal FatPer100g,
    decimal? FiberPer100g,
    decimal? SugarPer100g,
    decimal? SodiumMgPer100g,
    bool IsCustom,
    IReadOnlyList<FoodMicronutrientDto> Micronutrients);

public record FoodSearchResult(IReadOnlyList<FoodListItemDto> Items, int TotalCount, int Page, int PageSize);

public record CreateCustomFoodRequest(
    string Name,
    string? Brand,
    decimal CaloriesPer100g,
    decimal ProteinPer100g,
    decimal CarbPer100g,
    decimal FatPer100g,
    decimal? FiberPer100g,
    decimal? SugarPer100g,
    decimal? SodiumMgPer100g);
