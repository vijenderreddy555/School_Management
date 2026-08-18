using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolMgmt.Domain.Entities;

namespace SchoolMgmt.Infrastructure.Persistence.Configurations;

public class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        builder.ToTable("students");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.StudentCode).HasMaxLength(20).IsRequired();
        builder.HasIndex(s => s.StudentCode).IsUnique();

        builder.Property(s => s.FirstName).HasMaxLength(50).IsRequired();
        builder.Property(s => s.LastName).HasMaxLength(50).IsRequired();
        builder.Property(s => s.Gender).HasConversion<string>().HasMaxLength(20).IsRequired();

        builder.Property(s => s.NationalId).HasMaxLength(20).IsRequired();
        builder.HasIndex(s => s.NationalId).IsUnique();

        builder.Property(s => s.EmergencyContactNo).HasMaxLength(15).IsRequired();
        builder.Property(s => s.BloodGroup).HasConversion<string>().HasMaxLength(10);
        builder.Property(s => s.MedicalAlerts).HasMaxLength(500);
        builder.Property(s => s.Status).HasConversion<string>().HasMaxLength(20).IsRequired();

        // Prevent duplicate roll numbers within the same academic year/grade/section scope.
        builder.HasIndex(s => new { s.AcademicYearId, s.GradeId, s.SectionId, s.RollNumber }).IsUnique();

        // Indexed for sub-800ms directory search per NFR.
        builder.HasIndex(s => new { s.FirstName, s.LastName });
        builder.HasIndex(s => new { s.GradeId, s.SectionId });

        builder.HasOne(s => s.AcademicYear)
            .WithMany(a => a.Students)
            .HasForeignKey(s => s.AcademicYearId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Grade)
            .WithMany(g => g.Students)
            .HasForeignKey(s => s.GradeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.Section)
            .WithMany(sec => sec.Students)
            .HasForeignKey(s => s.SectionId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.PrimaryGuardian)
            .WithMany(g => g.Students)
            .HasForeignKey(s => s.PrimaryGuardianId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
