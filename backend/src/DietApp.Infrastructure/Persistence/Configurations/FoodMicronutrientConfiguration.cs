using DietApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DietApp.Infrastructure.Persistence.Configurations;

public class FoodMicronutrientConfiguration : IEntityTypeConfiguration<FoodMicronutrient>
{
    public void Configure(EntityTypeBuilder<FoodMicronutrient> builder)
    {
        builder.ToTable("FoodMicronutrients");
        builder.HasKey(m => m.Id);

        builder.Property(m => m.NutrientCode).IsRequired().HasMaxLength(32);
        builder.Property(m => m.Unit).IsRequired().HasMaxLength(16);
        builder.Property(m => m.AmountPer100g).HasColumnType("decimal(10,4)");

        builder.HasIndex(m => new { m.FoodItemId, m.NutrientCode }).IsUnique();
    }
}
