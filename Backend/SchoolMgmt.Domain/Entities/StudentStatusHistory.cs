using SchoolMgmt.Domain.Enums;

namespace SchoolMgmt.Domain.Entities;

public class StudentStatusHistory
{
    public Guid Id { get; set; }
    public Guid StudentId { get; set; }
    public Student? Student { get; set; }
    public StudentStatus PreviousStatus { get; set; }
    public StudentStatus NewStatus { get; set; }
    public string ChangeReason { get; set; } = string.Empty;
    public Guid ChangedByUserId { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
