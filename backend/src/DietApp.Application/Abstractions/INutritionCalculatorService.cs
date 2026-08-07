using DietApp.Domain.Entities;

namespace DietApp.Application.Abstractions;

public record NutritionCalculationResult(int DailyCalories, int ProteinG, int CarbG, int FatG);

public interface INutritionCalculatorService
{
    NutritionCalculationResult Calculate(UserProfile profile);
}
