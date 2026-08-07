using DietApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DietApp.Infrastructure.Persistence.Configurations;

public class MealEntryConfiguration : IEntityTypeConfiguration<MealEntry>
{
    public void Configure(EntityTypeBuilder<MealEntry> builder)
    {
        builder.ToTable("MealEntries");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.MealType).HasConversion<string>().HasMaxLength(16);

        builder.HasIndex(e => new { e.UserId, e.LogDate, e.MealType }).IsUnique();

        builder.HasOne(e => e.User)
            .WithMany(u => u.MealEntries)
            .HasForeignKey(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Items)
            .WithOne(i => i.MealEntry)
            .HasForeignKey(i => i.MealEntryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
