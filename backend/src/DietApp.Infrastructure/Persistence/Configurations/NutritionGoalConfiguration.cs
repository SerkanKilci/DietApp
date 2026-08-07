using DietApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DietApp.Infrastructure.Persistence.Configurations;

public class NutritionGoalConfiguration : IEntityTypeConfiguration<NutritionGoal>
{
    public void Configure(EntityTypeBuilder<NutritionGoal> builder)
    {
        builder.ToTable("NutritionGoals");
        builder.HasKey(g => g.Id);

        builder.HasOne(g => g.User)
            .WithMany(u => u.NutritionGoals)
            .HasForeignKey(g => g.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(g => new { g.UserId, g.EffectiveFrom });
    }
}
