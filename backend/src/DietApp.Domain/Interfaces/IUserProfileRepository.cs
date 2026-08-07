using DietApp.Domain.Entities;

namespace DietApp.Domain.Interfaces;

public interface IUserProfileRepository
{
    Task<UserProfile?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task UpsertAsync(UserProfile profile, CancellationToken ct = default);
}
