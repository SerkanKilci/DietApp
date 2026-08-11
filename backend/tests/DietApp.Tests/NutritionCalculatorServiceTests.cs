using DietApp.Domain.Entities;
using DietApp.Domain.Enums;
using DietApp.Infrastructure.Nutrition;

namespace DietApp.Tests;

public class NutritionCalculatorServiceTests
{
    private readonly NutritionCalculatorService sut = new();

    // BirthDate'i "bugün - yaş yıl" olarak kurmak, GetAge()'in test her ne zaman çalışırsa
    // çalışsın (DateTime.UtcNow'a bağlı olsa da) her zaman tam olarak `age` dönmesini sağlar.
    private static DateOnly BirthDateForAge(int age) => DateOnly.FromDateTime(DateTime.UtcNow).AddYears(-age);

    private static UserProfile MakeProfile(
        Gender gender, int age, decimal weightKg, int heightCm, ActivityLevel activityLevel, Goal goal) =>
        new()
        {
            Gender = gender,
            BirthDate = BirthDateForAge(age),
            WeightKg = weightKg,
            HeightCm = heightCm,
            ActivityLevel = activityLevel,
            Goal = goal,
        };

    [Fact]
    public void Calculate_MaintainGoal_MatchesMifflinStJeorByHand()
    {
        // Erkek, 30 yaş, 80kg, 180cm, hareketsiz, kilo koruma.
        // BMR = 10*80 + 6.25*180 - 5*30 + 5 = 1780; TDEE = 1780 * 1.2 = 2136.
        var profile = MakeProfile(Gender.Male, 30, 80m, 180, ActivityLevel.Sedentary, Goal.Maintain);

        var result = sut.Calculate(profile);

        Assert.Equal(2136, result.DailyCalories);
        Assert.Equal(128, result.ProteinG); // 80kg * 1.6 g/kg
        Assert.Equal(59, result.FatG); // round(2136 * 0.25 / 9)
        Assert.Equal(273, result.CarbG); // kalan kaloriden
    }

    [Fact]
    public void Calculate_LoseGoal_SubtractsFiveHundredCaloriesFromTdee()
    {
        // Kadın, 25 yaş, 60kg, 165cm, az aktif, kilo verme.
        // BMR = 600 + 1031.25 - 125 - 161 = 1345.25; TDEE = 1345.25 * 1.375 = 1849.71875.
        var profile = MakeProfile(Gender.Female, 25, 60m, 165, ActivityLevel.Light, Goal.Lose);

        var result = sut.Calculate(profile);

        Assert.Equal(1350, result.DailyCalories); // round(TDEE - 500)
        Assert.Equal(120, result.ProteinG); // 60kg * 2.0 g/kg (kesim fazı)
    }

    [Fact]
    public void Calculate_NeverGoesBelowSafetyFloor_ForVeryLowTdee()
    {
        // Kadın, 70 yaş, 45kg, 150cm, hareketsiz, kilo verme — ham TDEE-500 hesap 1200'ün altında kalır.
        var profile = MakeProfile(Gender.Female, 70, 45m, 150, ActivityLevel.Sedentary, Goal.Lose);

        var result = sut.Calculate(profile);

        Assert.Equal(1200, result.DailyCalories); // kadın güvenlik tabanı
    }

    [Fact]
    public void Calculate_MacrosAlwaysAddUpToDailyCalories()
    {
        var profile = MakeProfile(Gender.Male, 40, 95m, 175, ActivityLevel.Active, Goal.Gain);

        var result = sut.Calculate(profile);

        var caloriesFromMacros = result.ProteinG * 4 + result.CarbG * 4 + result.FatG * 9;

        // Yuvarlama nedeniyle birebir eşit olmayabilir ama birkaç kcal'den fazla sapmamalı.
        Assert.InRange(caloriesFromMacros, result.DailyCalories - 5, result.DailyCalories + 5);
    }

    [Fact]
    public void Calculate_MaleAndFemaleBmrDifferBySameHeightWeightAge_AsPerFormulaConstant()
    {
        var male = MakeProfile(Gender.Male, 35, 70m, 170, ActivityLevel.Sedentary, Goal.Maintain);
        var female = MakeProfile(Gender.Female, 35, 70m, 170, ActivityLevel.Sedentary, Goal.Maintain);

        var maleResult = sut.Calculate(male);
        var femaleResult = sut.Calculate(female);

        // Mifflin-St Jeor: erkek formülü +5, kadın formülü -161 sabiti kullanır — fark BMR'de 166,
        // TDEE'de bu farkın 1.2 (sedentary) katı kadar kendini gösterir.
        Assert.Equal((int)Math.Round(166 * 1.2), maleResult.DailyCalories - femaleResult.DailyCalories);
    }
}
