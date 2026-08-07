using DietApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DietApp.Infrastructure.Persistence.Configurations;

public class MealEntryItemConfiguration : IEntityTypeConfiguration<MealEntryItem>
{
    public void Configure(EntityTypeBuilder<MealEntryItem> builder)
    {
        builder.ToTable("MealEntryItems");
        builder.HasKey(i => i.Id);

        builder.Property(i => i.CustomDescription).HasMaxLength(256);
        builder.Property(i => i.QuantityG).HasColumnType("decimal(7,2)");
        builder.Property(i => i.CaloriesTotal).HasColumnType("decimal(7,2)");
        builder.Property(i => i.ProteinTotal).HasColumnType("decimal(7,2)");
        builder.Property(i => i.CarbTotal).HasColumnType("decimal(7,2)");
        builder.Property(i => i.FatTotal).HasColumnType("decimal(7,2)");

        // FoodItem silinirse (bu aşamada API'de yok ama ileride olabilir) geçmiş günlük kaydı
        // kaybolmasın diye FK null'lanır, satır silinmez.
        builder.HasOne(i => i.FoodItem)
            .WithMany()
            .HasForeignKey(i => i.FoodItemId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
