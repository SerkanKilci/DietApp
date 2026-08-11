using DietApp.Domain.Entities;

namespace DietApp.Domain.Interfaces;

public interface IFoodItemRepository
{
    // languageCode: "tr"/"fr"/"de" gibi bir çeviri varsa FoodItem.Translations'a (filtrelenmiş) o satır yüklenir,
    // yoksa (ör. "en" ya da hiç çevirisi olmayan bir kayıt) boş kalır ve çağıran taraf FoodItem.Name'e düşer.
    Task<FoodItem?> GetByIdAsync(Guid id, string languageCode, CancellationToken ct = default);
    Task<(IReadOnlyList<FoodItem> Items, int TotalCount)> SearchAsync(
        string? query, Guid? createdByUserId, string languageCode, int page, int pageSize, CancellationToken ct = default);
    Task AddAsync(FoodItem foodItem, CancellationToken ct = default);
}
