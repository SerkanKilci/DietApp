using DietApp.Domain.Entities;
using DietApp.Domain.Enums;
using DietApp.Domain.Interfaces;
using DietApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DietApp.Infrastructure.Repositories;

public class FoodItemRepository(DietAppDbContext dbContext) : IFoodItemRepository
{
    public Task<FoodItem?> GetByIdAsync(Guid id, string languageCode, CancellationToken ct = default) =>
        dbContext.FoodItems
            .Include(f => f.Micronutrients)
            .Include(f => f.Translations.Where(t => t.LanguageCode == languageCode))
            .FirstOrDefaultAsync(f => f.Id == id, ct);

    public async Task<(IReadOnlyList<FoodItem> Items, int TotalCount)> SearchAsync(
        string? query, Guid? createdByUserId, string languageCode, int page, int pageSize, CancellationToken ct = default)
    {
        // Herkese açık (USDA/OFF) kayıtlar + isteği yapan kullanıcının kendi özel yemekleri.
        // Başka bir kullanıcının özel yemeği aramada görünmez.
        var baseQuery = dbContext.FoodItems
            .Include(f => f.Translations.Where(t => t.LanguageCode == languageCode))
            .Where(f => f.Source != FoodSource.UserCreated || f.CreatedByUserId == createdByUserId);

        if (!string.IsNullOrWhiteSpace(query))
        {
            // İsim İngilizce'de VEYA istenen dildeki çeviride eşleşirse sonuçlara girer.
            baseQuery = baseQuery.Where(f =>
                EF.Functions.Like(f.Name, $"%{query}%") ||
                f.Translations.Any(t => t.LanguageCode == languageCode && EF.Functions.Like(t.Name, $"%{query}%")));
        }

        var totalCount = await baseQuery.CountAsync(ct);

        var items = await baseQuery
            .OrderBy(f => f.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return (items, totalCount);
    }

    public async Task AddAsync(FoodItem foodItem, CancellationToken ct = default)
    {
        dbContext.FoodItems.Add(foodItem);
        await dbContext.SaveChangesAsync(ct);
    }
}
