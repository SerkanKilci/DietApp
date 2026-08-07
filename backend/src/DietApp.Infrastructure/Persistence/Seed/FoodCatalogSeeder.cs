using System.Text.Json;
using DietApp.Domain.Entities;
using DietApp.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace DietApp.Infrastructure.Persistence.Seed;

internal record SeedMicronutrient(string Code, decimal AmountPer100g, string Unit);

internal record SeedFoodItem(
    string Source,
    string? ExternalCode,
    string Name,
    string? Brand,
    decimal CaloriesPer100g,
    decimal ProteinPer100g,
    decimal CarbPer100g,
    decimal FatPer100g,
    decimal? FiberPer100g,
    decimal? SugarPer100g,
    decimal? SodiumMgPer100g,
    List<SeedMicronutrient>? Micronutrients);

/// <summary>
/// Küçük, elle küratize edilmiş bir başlangıç veri seti (yaygın besinler + birkaç markalı ürün) —
/// geliştirme/test sırasında arama ve besin ekleme akışlarını gerçek verilerle deneyebilmek için.
/// Tam ölçekli USDA/Open Food Facts içe aktarımı için <c>DietApp.Tools.FoodImporter</c> aracını kullan.
/// </summary>
public static class FoodCatalogSeeder
{
    public static async Task SeedAsync(DietAppDbContext dbContext, CancellationToken ct = default)
    {
        if (await dbContext.FoodItems.AnyAsync(ct))
        {
            return;
        }

        var seedFilePath = Path.Combine(AppContext.BaseDirectory, "Persistence", "Seed", "food_seed.json");
        if (!File.Exists(seedFilePath))
        {
            return;
        }

        var json = await File.ReadAllTextAsync(seedFilePath, ct);
        var seedItems = JsonSerializer.Deserialize<List<SeedFoodItem>>(json, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        }) ?? [];

        var foodItems = seedItems.Select(item => new FoodItem
        {
            Id = Guid.NewGuid(),
            Source = Enum.Parse<FoodSource>(item.Source),
            ExternalCode = item.ExternalCode,
            Name = item.Name,
            Brand = item.Brand,
            CaloriesPer100g = item.CaloriesPer100g,
            ProteinPer100g = item.ProteinPer100g,
            CarbPer100g = item.CarbPer100g,
            FatPer100g = item.FatPer100g,
            FiberPer100g = item.FiberPer100g,
            SugarPer100g = item.SugarPer100g,
            SodiumMgPer100g = item.SodiumMgPer100g,
            IsVerified = true,
            CreatedAt = DateTime.UtcNow,
            Micronutrients = (item.Micronutrients ?? []).Select(m => new FoodMicronutrient
            {
                Id = Guid.NewGuid(),
                NutrientCode = m.Code,
                AmountPer100g = m.AmountPer100g,
                Unit = m.Unit,
            }).ToList(),
        }).ToList();

        dbContext.FoodItems.AddRange(foodItems);
        await dbContext.SaveChangesAsync(ct);
    }
}
