using DietApp.Domain.Entities;
using DietApp.Domain.Interfaces;
using DietApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DietApp.Infrastructure.Repositories;

public class MealEntryItemRepository(DietAppDbContext dbContext) : IMealEntryItemRepository
{
    public Task<MealEntryItem?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        dbContext.MealEntryItems.Include(i => i.MealEntry).FirstOrDefaultAsync(i => i.Id == id, ct);

    public async Task AddAsync(MealEntryItem item, CancellationToken ct = default)
    {
        dbContext.MealEntryItems.Add(item);
        await dbContext.SaveChangesAsync(ct);
    }

    public async Task DeleteAsync(MealEntryItem item, CancellationToken ct = default)
    {
        dbContext.MealEntryItems.Remove(item);
        await dbContext.SaveChangesAsync(ct);
    }
}
