using DietApp.Domain.Entities;

namespace DietApp.Domain.Interfaces;

public interface IAiPlateAnalysisRepository
{
    Task<AiPlateAnalysis?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(AiPlateAnalysis analysis, CancellationToken ct = default);
    Task<int> CountTodayForUserAsync(Guid userId, CancellationToken ct = default);
}
