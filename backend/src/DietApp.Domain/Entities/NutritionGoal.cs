namespace DietApp.Domain.Entities;

/// <summary>
/// Belirli bir tarihten itibaren geçerli olan günlük hedef — profil her güncellendiğinde
/// yeni bir satır eklenir (UPDATE değil), böylece geçmişteki hedefler korunur.
/// </summary>
public class NutritionGoal
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public int DailyCalories { get; set; }
    public int ProteinG { get; set; }
    public int CarbG { get; set; }
    public int FatG { get; set; }

    public DateTime EffectiveFrom { get; set; }
    public DateTime CreatedAt { get; set; }
}
