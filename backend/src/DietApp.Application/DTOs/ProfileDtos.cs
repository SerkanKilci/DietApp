using DietApp.Domain.Enums;

namespace DietApp.Application.DTOs;

public record OnboardingRequest(
    int HeightCm,
    decimal WeightKg,
    DateOnly BirthDate,
    Gender Gender,
    ActivityLevel ActivityLevel,
    Goal Goal,
    decimal? GoalWeightKg);

public record NutritionGoalDto(int DailyCalories, int ProteinG, int CarbG, int FatG, DateTime EffectiveFrom);

/// <summary>Kullanıcı, otomatik hesaplanan hedefi beğenmeyip kendi kalori/makro hedefini elle girebilir.</summary>
public record SetCustomNutritionGoalRequest(int DailyCalories, int ProteinG, int CarbG, int FatG);

public record ProfileDto(
    int HeightCm,
    decimal WeightKg,
    DateOnly BirthDate,
    Gender Gender,
    ActivityLevel ActivityLevel,
    Goal Goal,
    decimal? GoalWeightKg,
    NutritionGoalDto NutritionGoal);
