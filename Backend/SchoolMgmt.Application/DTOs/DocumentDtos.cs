using SchoolMgmt.Domain.Enums;

namespace SchoolMgmt.Application.DTOs;

public class UploadDocumentRequestDto
{
    public DocumentType DocumentType { get; set; }
}

public class DocumentResponseDto
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public DocumentType DocumentType { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public decimal FileSizeMb { get; set; }
    public DateTime UploadedAt { get; set; }
}
