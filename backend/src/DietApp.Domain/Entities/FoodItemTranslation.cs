namespace DietApp.Domain.Entities;

/// <summary>
/// FoodItem.Name her zaman İngilizce (USDA/OFF kaynak dili) kalır; buradaki satırlar
/// diğer diller için çeviridir. Sabit ve bilinen bir dil kümesi olduğundan FoodMicronutrient'taki
/// gibi EAV şekli (Id/FK/Code/Value) kullanılıyor ama kod kümesi burada dil koduna karşılık geliyor.
/// </summary>
public class FoodItemTranslation
{
    public Guid Id { get; set; }
    public Guid FoodItemId { get; set; }
    public FoodItem FoodItem { get; set; } = default!;

    /// <summary>ISO 639-1 kod, örn. "tr", "fr", "de".</summary>
    public string LanguageCode { get; set; } = default!;
    public string Name { get; set; } = default!;
}
