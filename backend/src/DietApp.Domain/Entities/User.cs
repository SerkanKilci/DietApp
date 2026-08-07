namespace DietApp.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = default!;
    public string? PasswordHash { get; set; }
    public string DisplayName { get; set; } = default!;
    public bool IsEmailVerified { get; set; }
    public DateTime CreatedAt { get; set; }

    public ICollection<ExternalLogin> ExternalLogins { get; set; } = new List<ExternalLogin>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public UserProfile? Profile { get; set; }
    public ICollection<NutritionGoal> NutritionGoals { get; set; } = new List<NutritionGoal>();
    public ICollection<MealEntry> MealEntries { get; set; } = new List<MealEntry>();
}
