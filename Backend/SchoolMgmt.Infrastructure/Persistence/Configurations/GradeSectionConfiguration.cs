using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolMgmt.Domain.Entities;

namespace SchoolMgmt.Infrastructure.Persistence.Configurations;

public class GradeConfiguration : IEntityTypeConfiguration<Grade>
{
    public void Configure(EntityTypeBuilder<Grade> builder)
    {
        builder.ToTable("grades");
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Name).HasMaxLength(50).IsRequired();
        builder.Property(g => g.Code).HasMaxLength(20).IsRequired();
        builder.HasIndex(g => g.Code).IsUnique();
    }
}

public class SectionConfiguration : IEntityTypeConfiguration<Section>
{
    public void Configure(EntityTypeBuilder<Section> builder)
    {
        builder.ToTable("sections");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Name).HasMaxLength(10).IsRequired();
        builder.Property(s => s.Capacity).HasDefaultValue(40);
        builder.Property(s => s.EnrolledCount).HasDefaultValue(0);
        builder.HasOne(s => s.Grade)
            .WithMany(g => g.Sections)
            .HasForeignKey(s => s.GradeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
