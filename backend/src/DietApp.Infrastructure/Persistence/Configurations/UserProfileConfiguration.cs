using DietApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DietApp.Infrastructure.Persistence.Configurations;

public class UserProfileConfiguration : IEntityTypeConfiguration<UserProfile>
{
    public void Configure(EntityTypeBuilder<UserProfile> builder)
    {
        builder.ToTable("UserProfiles");
        builder.HasKey(p => p.UserId);

        builder.Property(p => p.WeightKg).HasColumnType("decimal(5,2)");
        builder.Property(p => p.GoalWeightKg).HasColumnType("decimal(5,2)");
        builder.Property(p => p.Gender).HasConversion<string>().HasMaxLength(16);
        builder.Property(p => p.ActivityLevel).HasConversion<string>().HasMaxLength(16);
        builder.Property(p => p.Goal).HasConversion<string>().HasMaxLength(16);

        builder.HasOne(p => p.User)
            .WithOne(u => u.Profile)
            .HasForeignKey<UserProfile>(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
