using DietApp.Application.DTOs;
using DietApp.Application.Exceptions;
using DietApp.Domain.Entities;
using DietApp.Domain.Enums;
using DietApp.Domain.Interfaces;

namespace DietApp.Application.Services;

public class MealDiaryService(
    IMealEntryRepository mealEntryRepository,
    IMealEntryItemRepository mealEntryItemRepository,
    IFoodItemRepository foodItemRepository,
    INutritionGoalRepository nutritionGoalRepository) : IMealDiaryService
{
    public async Task<MealEntryItemDto> AddItemAsync(Guid userId, AddMealItemRequest request, CancellationToken ct = default)
    {
        if (request.QuantityG <= 0)
        {
            throw new ValidationException("Miktar 0'dan büyük olmalı.");
        }

        var food = await foodItemRepository.GetByIdAsync(request.FoodItemId, ct)
            ?? throw new ValidationException("Besin bulunamadı.");

        if (food.Source == FoodSource.UserCreated && food.CreatedByUserId != userId)
        {
            throw new ValidationException("Besin bulunamadı.");
        }

        var factor = request.QuantityG / 100m;

        var mealEntry = await mealEntryRepository.GetOrCreateAsync(userId, request.LogDate, request.MealType, ct);

        var item = new MealEntryItem
        {
            Id = Guid.NewGuid(),
            MealEntryId = mealEntry.Id,
            FoodItemId = food.Id,
            QuantityG = request.QuantityG,
            CaloriesTotal = Math.Round(food.CaloriesPer100g * factor, 2),
            ProteinTotal = Math.Round(food.ProteinPer100g * factor, 2),
            CarbTotal = Math.Round(food.CarbPer100g * factor, 2),
            FatTotal = Math.Round(food.FatPer100g * factor, 2),
            IsAiEstimated = false,
            CreatedAt = DateTime.UtcNow,
        };

        await mealEntryItemRepository.AddAsync(item, ct);

        return new MealEntryItemDto(item.Id, food.Id, food.Name, item.QuantityG, item.CaloriesTotal, item.ProteinTotal, item.CarbTotal, item.FatTotal);
    }

    public async Task<DailySummaryDto> GetDailySummaryAsync(Guid userId, DateOnly logDate, CancellationToken ct = default)
    {
        var goal = await nutritionGoalRepository.GetCurrentAsync(userId, ct)
            ?? throw new ValidationException("Önce onboarding tamamlanmalı.");

        var mealEntries = await mealEntryRepository.GetByUserAndDateAsync(userId, logDate, ct);
        var entriesByType = mealEntries.ToDictionary(e => e.MealType);

        var mealGroups = Enum.GetValues<MealType>().Select(mealType =>
        {
            var itemDtos = entriesByType.TryGetValue(mealType, out var entry)
                ? entry.Items.Select(i => new MealEntryItemDto(
                    i.Id, i.FoodItemId, i.FoodItem?.Name ?? i.CustomDescription ?? "Bilinmeyen besin",
                    i.QuantityG, i.CaloriesTotal, i.ProteinTotal, i.CarbTotal, i.FatTotal)).ToList()
                : [];

            return new MealGroupDto(mealType, itemDtos, itemDtos.Sum(i => i.CaloriesTotal));
        }).ToList();

        var allItems = mealGroups.SelectMany(g => g.Items).ToList();
        var consumedCalories = allItems.Sum(i => i.CaloriesTotal);
        var consumedProtein = allItems.Sum(i => i.ProteinTotal);
        var consumedCarb = allItems.Sum(i => i.CarbTotal);
        var consumedFat = allItems.Sum(i => i.FatTotal);

        return new DailySummaryDto(
            logDate,
            goal.DailyCalories,
            goal.ProteinG,
            goal.CarbG,
            goal.FatG,
            consumedCalories,
            consumedProtein,
            consumedCarb,
            consumedFat,
            goal.DailyCalories - consumedCalories,
            mealGroups);
    }

    public async Task DeleteItemAsync(Guid userId, Guid itemId, CancellationToken ct = default)
    {
        var item = await mealEntryItemRepository.GetByIdAsync(itemId, ct);
        if (item is null || item.MealEntry.UserId != userId)
        {
            return;
        }

        await mealEntryItemRepository.DeleteAsync(item, ct);
    }
}
