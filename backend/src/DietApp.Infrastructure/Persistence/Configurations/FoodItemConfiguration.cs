using DietApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DietApp.Infrastructure.Persistence.Configurations;

public class FoodItemConfiguration : IEntityTypeConfiguration<FoodItem>
{
    public void Configure(EntityTypeBuilder<FoodItem> builder)
    {
        builder.ToTable("FoodItems");
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Source).HasConversion<string>().HasMaxLength(16);
        builder.Property(f => f.ExternalCode).HasMaxLength(64);
        builder.Property(f => f.Name).IsRequired().HasMaxLength(256);
        builder.Property(f => f.Brand).HasMaxLength(128);

        builder.Property(f => f.CaloriesPer100g).HasColumnType("decimal(7,2)");
        builder.Property(f => f.ProteinPer100g).HasColumnType("decimal(7,2)");
        builder.Property(f => f.CarbPer100g).HasColumnType("decimal(7,2)");
        builder.Property(f => f.FatPer100g).HasColumnType("decimal(7,2)");
        builder.Property(f => f.FiberPer100g).HasColumnType("decimal(7,2)");
        builder.Property(f => f.SugarPer100g).HasColumnType("decimal(7,2)");
        builder.Property(f => f.SodiumMgPer100g).HasColumnType("decimal(9,2)");

        builder.HasIndex(f => f.Name);
        builder.HasIndex(f => new { f.Source, f.ExternalCode });

        builder.HasOne(f => f.CreatedByUser)
            .WithMany()
            .HasForeignKey(f => f.CreatedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(f => f.Micronutrients)
            .WithOne(m => m.FoodItem)
            .HasForeignKey(m => m.FoodItemId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
