using DietApp.Domain.Enums;

namespace DietApp.Domain.Entities;

public class UserProfile
{
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public int HeightCm { get; set; }
    public decimal WeightKg { get; set; }
    public DateOnly BirthDate { get; set; }
    public Gender Gender { get; set; }
    public ActivityLevel ActivityLevel { get; set; }
    public Goal Goal { get; set; }
    public decimal? GoalWeightKg { get; set; }

    public DateTime UpdatedAt { get; set; }
}
