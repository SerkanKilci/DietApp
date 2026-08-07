using DietApp.Domain.Enums;

namespace DietApp.Domain.Entities;

public class ExternalLogin
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;
    public ExternalLoginProvider Provider { get; set; }
    public string ProviderUserId { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
}
