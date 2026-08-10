using DietApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DietApp.Infrastructure.Persistence.Configurations;

public class AiPlateAnalysisConfiguration : IEntityTypeConfiguration<AiPlateAnalysis>
{
    public void Configure(EntityTypeBuilder<AiPlateAnalysis> builder)
    {
        builder.ToTable("AiPlateAnalyses");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Description).IsRequired().HasMaxLength(512);
        builder.Property(a => a.RawResponseJson).IsRequired();

        builder.HasOne(a => a.User)
            .WithMany()
            .HasForeignKey(a => a.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(a => new { a.UserId, a.CreatedAt });
    }
}
