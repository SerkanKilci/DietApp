using DietApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DietApp.Infrastructure.Persistence.Configurations;

public class ExternalLoginConfiguration : IEntityTypeConfiguration<ExternalLogin>
{
    public void Configure(EntityTypeBuilder<ExternalLogin> builder)
    {
        builder.ToTable("ExternalLogins");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.ProviderUserId).IsRequired().HasMaxLength(256);
        builder.Property(e => e.Provider).HasConversion<string>().HasMaxLength(32);

        builder.HasIndex(e => new { e.Provider, e.ProviderUserId }).IsUnique();
    }
}
