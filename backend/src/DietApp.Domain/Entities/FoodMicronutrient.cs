namespace DietApp.Domain.Entities;

/// <summary>
/// FoodItem başına değişken sayıda mikro besin — sabit sayıda nullable kolon yerine
/// esnek bir key-value (EAV) tablo: USDA/OFF'tan gelen mikro besin seti değişkendir.
/// </summary>
public class FoodMicronutrient
{
    public Guid Id { get; set; }
    public Guid FoodItemId { get; set; }
    public FoodItem FoodItem { get; set; } = default!;

    /// <summary>Örn. "VITAMIN_C", "IRON", "CALCIUM", "POTASSIUM".</summary>
    public string NutrientCode { get; set; } = default!;
    public decimal AmountPer100g { get; set; }
    public string Unit { get; set; } = default!;
}
