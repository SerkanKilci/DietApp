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

public record ProfileDto(
    int HeightCm,
    decimal WeightKg,
    DateOnly BirthDate,
    Gender Gender,
    ActivityLevel ActivityLevel,
    Goal Goal,
    decimal? GoalWeightKg,
    NutritionGoalDto NutritionGoal);
