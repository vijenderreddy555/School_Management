using SchoolMgmt.Domain.Enums;

namespace SchoolMgmt.Domain.Entities;

public class StudentDocument
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public Student? Student { get; set; }
    public DocumentType DocumentType { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public decimal FileSizeMb { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
