using DietApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DietApp.Infrastructure.Persistence;

public class DietAppDbContext : DbContext
{
    public DietAppDbContext(DbContextOptions<DietAppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<ExternalLogin> ExternalLogins => Set<ExternalLogin>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<NutritionGoal> NutritionGoals => Set<NutritionGoal>();
    public DbSet<FoodItem> FoodItems => Set<FoodItem>();
    public DbSet<FoodMicronutrient> FoodMicronutrients => Set<FoodMicronutrient>();
    public DbSet<MealEntry> MealEntries => Set<MealEntry>();
    public DbSet<MealEntryItem> MealEntryItems => Set<MealEntryItem>();
    public DbSet<AiPlateAnalysis> AiPlateAnalyses => Set<AiPlateAnalysis>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(DietAppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
