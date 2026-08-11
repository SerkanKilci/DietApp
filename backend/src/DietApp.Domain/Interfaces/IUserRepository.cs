using DietApp.Domain.Entities;
using DietApp.Domain.Enums;

namespace DietApp.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> GetByExternalLoginAsync(ExternalLoginProvider provider, string providerUserId, CancellationToken ct = default);
    Task AddAsync(User user, CancellationToken ct = default);
    Task AddExternalLoginAsync(ExternalLogin externalLogin, CancellationToken ct = default);
    Task DeleteAsync(User user, CancellationToken ct = default);
}
