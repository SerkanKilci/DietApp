using DietApp.Application.Abstractions;
using DietApp.Domain.Common;
using DietApp.Domain.Entities;
using DietApp.Domain.Enums;

namespace DietApp.Infrastructure.Nutrition;

public class NutritionCalculatorService : INutritionCalculatorService
{
    private static readonly Dictionary<ActivityLevel, double> ActivityMultipliers = new()
    {
        [ActivityLevel.Sedentary] = 1.2,
        [ActivityLevel.Light] = 1.375,
        [ActivityLevel.Moderate] = 1.55,
        [ActivityLevel.Active] = 1.725,
        [ActivityLevel.VeryActive] = 1.9,
    };

    public NutritionCalculationResult Calculate(UserProfile profile)
    {
        var age = profile.BirthDate.GetAge();
        var weight = (double)profile.WeightKg;
        var height = profile.HeightCm;

        // Mifflin-St Jeor: en yaygın kabul gören, doğruluğu klinik olarak diğer formüllere göre
        // (örn. Harris-Benedict) daha yüksek bulunan bazal metabolizma hızı (BMR) formülü.
        var bmr = profile.Gender == Gender.Male
            ? 10 * weight + 6.25 * height - 5 * age + 5
            : 10 * weight + 6.25 * height - 5 * age - 161;

        var tdee = bmr * ActivityMultipliers[profile.ActivityLevel];

        var targetCalories = profile.Goal switch
        {
            Goal.Lose => tdee - 500, // ~0.5 kg/hafta kayıp için standart açık
            Goal.Gain => tdee + 300, // yağlanmayı sınırlamak için ölçülü bir fazla
            _ => tdee,
        };

        // Aşırı düşük kalori hedefi önermemek için güvenlik tabanı.
        var floor = profile.Gender == Gender.Male ? 1500 : 1200;
        targetCalories = Math.Max(targetCalories, floor);

        // Protein hedefi kilogram başına, diyet fazına göre değişir (kesimde kas kaybını önlemek
        // için daha yüksek); kalan kalori kabaca %25 yağ, geri kalanı karbonhidrat olarak bölünür.
        var proteinPerKg = profile.Goal switch
        {
            Goal.Lose => 2.0,
            Goal.Gain => 1.8,
            _ => 1.6,
        };

        var proteinG = (int)Math.Round(weight * proteinPerKg);
        var fatG = (int)Math.Round(targetCalories * 0.25 / 9);
        var remainingCalories = targetCalories - proteinG * 4 - fatG * 9;
        var carbG = (int)Math.Max(0, Math.Round(remainingCalories / 4));

        return new NutritionCalculationResult((int)Math.Round(targetCalories), proteinG, carbG, fatG);
    }
}
