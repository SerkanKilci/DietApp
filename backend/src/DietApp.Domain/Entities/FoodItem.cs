using DietApp.Domain.Enums;

namespace DietApp.Domain.Entities;

public class FoodItem
{
    public Guid Id { get; set; }
    public FoodSource Source { get; set; }

    /// <summary>USDA fdcId, Open Food Facts barkodu vb. — kaynak sistemdeki kimlik.</summary>
    public string? ExternalCode { get; set; }

    public string Name { get; set; } = default!;
    public string? Brand { get; set; }

    public decimal CaloriesPer100g { get; set; }
    public decimal ProteinPer100g { get; set; }
    public decimal CarbPer100g { get; set; }
    public decimal FatPer100g { get; set; }
    public decimal? FiberPer100g { get; set; }
    public decimal? SugarPer100g { get; set; }
    public decimal? SodiumMgPer100g { get; set; }

    /// <summary>Kullanıcı kendi yemeğini eklediğinde dolu; USDA/OFF kayıtlarında null.</summary>
    public Guid? CreatedByUserId { get; set; }
    public User? CreatedByUser { get; set; }

    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<FoodMicronutrient> Micronutrients { get; set; } = new List<FoodMicronutrient>();
    public ICollection<FoodItemTranslation> Translations { get; set; } = new List<FoodItemTranslation>();
}
