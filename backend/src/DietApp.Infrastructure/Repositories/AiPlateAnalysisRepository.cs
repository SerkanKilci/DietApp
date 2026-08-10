using DietApp.Domain.Entities;
using DietApp.Domain.Interfaces;
using DietApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DietApp.Infrastructure.Repositories;

public class AiPlateAnalysisRepository(DietAppDbContext dbContext) : IAiPlateAnalysisRepository
{
    public Task<AiPlateAnalysis?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        dbContext.AiPlateAnalyses.FirstOrDefaultAsync(a => a.Id == id, ct);

    public async Task AddAsync(AiPlateAnalysis analysis, CancellationToken ct = default)
    {
        dbContext.AiPlateAnalyses.Add(analysis);
        await dbContext.SaveChangesAsync(ct);
    }

    public Task<int> CountTodayForUserAsync(Guid userId, CancellationToken ct = default)
    {
        var todayStart = DateTime.UtcNow.Date;
        var tomorrowStart = todayStart.AddDays(1);

        return dbContext.AiPlateAnalyses
            .CountAsync(a => a.UserId == userId && a.CreatedAt >= todayStart && a.CreatedAt < tomorrowStart, ct);
    }
}
