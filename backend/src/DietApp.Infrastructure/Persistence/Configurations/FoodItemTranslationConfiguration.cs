using DietApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DietApp.Infrastructure.Persistence.Configurations;

public class FoodItemTranslationConfiguration : IEntityTypeConfiguration<FoodItemTranslation>
{
    public void Configure(EntityTypeBuilder<FoodItemTranslation> builder)
    {
        builder.ToTable("FoodItemTranslations");
        builder.HasKey(t => t.Id);

        builder.Property(t => t.LanguageCode).IsRequired().HasMaxLength(5);
        builder.Property(t => t.Name).IsRequired().HasMaxLength(256);

        builder.HasIndex(t => new { t.FoodItemId, t.LanguageCode }).IsUnique();
    }
}
