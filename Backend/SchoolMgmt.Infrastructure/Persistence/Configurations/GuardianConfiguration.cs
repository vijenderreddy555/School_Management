using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolMgmt.Domain.Entities;

namespace SchoolMgmt.Infrastructure.Persistence.Configurations;

public class GuardianConfiguration : IEntityTypeConfiguration<Guardian>
{
    public void Configure(EntityTypeBuilder<Guardian> builder)
    {
        builder.ToTable("guardians");
        builder.HasKey(g => g.Id);
        builder.Property(g => g.FullName).HasMaxLength(100).IsRequired();
        builder.Property(g => g.Relationship).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(g => g.MobilePhone).HasMaxLength(15).IsRequired();
        builder.Property(g => g.EmailAddress).HasMaxLength(100);
    }
}
