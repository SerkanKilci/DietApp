using DietApp.Application.Abstractions;
using DietApp.Application.DTOs;
using DietApp.Application.Exceptions;
using DietApp.Domain.Common;
using DietApp.Domain.Entities;
using DietApp.Domain.Interfaces;

namespace DietApp.Application.Services;

public class ProfileService(
    IUserProfileRepository profileRepository,
    INutritionGoalRepository nutritionGoalRepository,
    INutritionCalculatorService nutritionCalculatorService) : IProfileService
{
    public async Task<ProfileDto?> GetProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var profile = await profileRepository.GetByUserIdAsync(userId, ct);
        if (profile is null)
        {
            return null;
        }

        var goal = await nutritionGoalRepository.GetCurrentAsync(userId, ct)
            ?? throw new InvalidOperationException("Profil var ama hedef bulunamadı — veri tutarsızlığı.");

        return MapToDto(profile, goal);
    }

    public async Task<ProfileDto> CompleteOnboardingAsync(Guid userId, OnboardingRequest request, CancellationToken ct = default)
    {
        Validate(request);

        var profile = await profileRepository.GetByUserIdAsync(userId, ct) ?? new UserProfile { UserId = userId };

        profile.HeightCm = request.HeightCm;
        profile.WeightKg = request.WeightKg;
        profile.BirthDate = request.BirthDate;
        profile.Gender = request.Gender;
        profile.ActivityLevel = request.ActivityLevel;
        profile.Goal = request.Goal;
        profile.GoalWeightKg = request.GoalWeightKg;
        profile.UpdatedAt = DateTime.UtcNow;

        await profileRepository.UpsertAsync(profile, ct);

        var calculation = nutritionCalculatorService.Calculate(profile);

        var nutritionGoal = new NutritionGoal
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DailyCalories = calculation.DailyCalories,
            ProteinG = calculation.ProteinG,
            CarbG = calculation.CarbG,
            FatG = calculation.FatG,
            EffectiveFrom = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
        };

        await nutritionGoalRepository.AddAsync(nutritionGoal, ct);

        return MapToDto(profile, nutritionGoal);
    }

    public async Task<ProfileDto> SetCustomNutritionGoalAsync(Guid userId, SetCustomNutritionGoalRequest request, CancellationToken ct = default)
    {
        ValidateCustomGoal(request);

        var profile = await profileRepository.GetByUserIdAsync(userId, ct)
            ?? throw new ValidationException("Önce onboarding tamamlanmalı.");

        var nutritionGoal = new NutritionGoal
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            DailyCalories = request.DailyCalories,
            ProteinG = request.ProteinG,
            CarbG = request.CarbG,
            FatG = request.FatG,
            EffectiveFrom = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
        };

        await nutritionGoalRepository.AddAsync(nutritionGoal, ct);

        return MapToDto(profile, nutritionGoal);
    }

    private static void ValidateCustomGoal(SetCustomNutritionGoalRequest request)
    {
        if (request.DailyCalories is < 800 or > 6000)
        {
            throw new ValidationException("Günlük kalori 800-6000 aralığında olmalı.");
        }

        if (request.ProteinG < 0 || request.CarbG < 0 || request.FatG < 0)
        {
            throw new ValidationException("Makro değerleri negatif olamaz.");
        }

        if (request.ProteinG > 500 || request.CarbG > 900 || request.FatG > 400)
        {
            throw new ValidationException("Girilen makro değerleri gerçekçi aralığın dışında.");
        }
    }

    private static void Validate(OnboardingRequest request)
    {
        if (request.HeightCm is < 100 or > 250)
        {
            throw new ValidationException("Boy 100-250 cm aralığında olmalı.");
        }

        if (request.WeightKg is < 30 or > 300)
        {
            throw new ValidationException("Kilo 30-300 kg aralığında olmalı.");
        }

        var age = request.BirthDate.GetAge();
        if (age is < 13 or > 100)
        {
            throw new ValidationException("Yaş 13-100 aralığında olmalı.");
        }
    }

    private static ProfileDto MapToDto(UserProfile profile, NutritionGoal goal) =>
        new(
            profile.HeightCm,
            profile.WeightKg,
            profile.BirthDate,
            profile.Gender,
            profile.ActivityLevel,
            profile.Goal,
            profile.GoalWeightKg,
            new NutritionGoalDto(goal.DailyCalories, goal.ProteinG, goal.CarbG, goal.FatG, goal.EffectiveFrom));
}
