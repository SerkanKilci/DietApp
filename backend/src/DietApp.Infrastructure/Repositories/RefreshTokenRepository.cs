using DietApp.Domain.Entities;
using DietApp.Domain.Interfaces;
using DietApp.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace DietApp.Infrastructure.Repositories;

public class RefreshTokenRepository(DietAppDbContext dbContext) : IRefreshTokenRepository
{
    public Task<RefreshToken?> GetByTokenHashAsync(string tokenHash, CancellationToken ct = default) =>
        dbContext.RefreshTokens.FirstOrDefaultAsync(r => r.TokenHash == tokenHash, ct);

    public async Task AddAsync(RefreshToken token, CancellationToken ct = default)
    {
        dbContext.RefreshTokens.Add(token);
        await dbContext.SaveChangesAsync(ct);
    }

    public async Task RevokeAsync(RefreshToken token, CancellationToken ct = default)
    {
        token.RevokedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(ct);
    }
}
