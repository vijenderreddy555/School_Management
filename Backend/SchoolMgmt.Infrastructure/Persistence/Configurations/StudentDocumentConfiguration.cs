using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SchoolMgmt.Domain.Entities;

namespace SchoolMgmt.Infrastructure.Persistence.Configurations;

public class StudentDocumentConfiguration : IEntityTypeConfiguration<StudentDocument>
{
    public void Configure(EntityTypeBuilder<StudentDocument> builder)
    {
        builder.ToTable("student_documents");
        builder.HasKey(d => d.Id);
        builder.Property(d => d.DocumentType).HasConversion<string>().HasMaxLength(30).IsRequired();
        builder.Property(d => d.FileUrl).IsRequired();
        builder.Property(d => d.FileSizeMb).HasColumnType("decimal(6,2)");

        builder.HasOne(d => d.Student)
            .WithMany(s => s.Documents)
            .HasForeignKey(d => d.StudentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class StudentStatusHistoryConfiguration : IEntityTypeConfiguration<StudentStatusHistory>
{
    public void Configure(EntityTypeBuilder<StudentStatusHistory> builder)
    {
        builder.ToTable("student_status_history");
        builder.HasKey(h => h.Id);
        builder.Property(h => h.PreviousStatus).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(h => h.NewStatus).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(h => h.ChangeReason).IsRequired();

        builder.HasOne(h => h.Student)
            .WithMany(s => s.StatusHistory)
            .HasForeignKey(h => h.StudentId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
