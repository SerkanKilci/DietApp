namespace DietApp.Domain.Entities;

/// <summary>
/// Bir tabak fotoğrafı için OpenAI Vision'dan alınan tahmin — hem kullanıcının günlüğe
/// eklemeden önce gözden geçirmesi hem de kullanım/kota takibi için saklanır.
/// </summary>
public class AiPlateAnalysis
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public string Description { get; set; } = default!;
    public int EstimatedCalories { get; set; }
    public int EstimatedProteinG { get; set; }
    public int EstimatedCarbG { get; set; }
    public int EstimatedFatG { get; set; }
    public string RawResponseJson { get; set; } = default!;

    public DateTime CreatedAt { get; set; }
}
