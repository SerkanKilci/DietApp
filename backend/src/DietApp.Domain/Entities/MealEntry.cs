using DietApp.Domain.Enums;

namespace DietApp.Domain.Entities;

/// <summary>Bir kullanıcının belirli bir gün + öğün tipi için tek satırı — her ekleme bu satıra bir MealEntryItem olarak eklenir.</summary>
public class MealEntry
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public DateOnly LogDate { get; set; }
    public MealType MealType { get; set; }
    public DateTime LoggedAt { get; set; }

    public ICollection<MealEntryItem> Items { get; set; } = new List<MealEntryItem>();
}
