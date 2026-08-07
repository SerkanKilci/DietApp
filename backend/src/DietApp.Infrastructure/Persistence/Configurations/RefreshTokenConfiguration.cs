using DietApp.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DietApp.Infrastructure.Persistence.Configurations;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens");
        builder.HasKey(r => r.Id);

        builder.Property(r => r.TokenHash).IsRequired().HasMaxLength(256);
        builder.HasIndex(r => r.TokenHash).IsUnique();

        builder.Property(r => r.CreatedByIp).HasMaxLength(64);

        builder.Ignore(r => r.IsActive);
    }
}
