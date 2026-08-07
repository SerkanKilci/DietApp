namespace DietApp.Domain.Entities;

/// <summary>
/// Besin değerleri ekleme anında snapshot olarak saklanır (FoodItem'a her seferinde join ile
/// hesaplamak yerine): FoodItems verisi ileride güncellenirse geçmiş günlük kayıtları değişmez.
/// </summary>
public class MealEntryItem
{
    public Guid Id { get; set; }
    public Guid MealEntryId { get; set; }
    public MealEntry MealEntry { get; set; } = default!;

    public Guid? FoodItemId { get; set; }
    public FoodItem? FoodItem { get; set; }

    /// <summary>Serbest metin açıklama — ileride AI tahmini gibi FoodItem'a bağlı olmayan kayıtlar için ayrılmıştır.</summary>
    public string? CustomDescription { get; set; }

    public decimal QuantityG { get; set; }
    public decimal CaloriesTotal { get; set; }
    public decimal ProteinTotal { get; set; }
    public decimal CarbTotal { get; set; }
    public decimal FatTotal { get; set; }

    public bool IsAiEstimated { get; set; }
    public DateTime CreatedAt { get; set; }
}
