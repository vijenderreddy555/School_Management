using SchoolMgmt.Domain.Enums;

namespace SchoolMgmt.Domain.Entities;

public class Guardian
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public Relationship Relationship { get; set; }
    public string MobilePhone { get; set; } = string.Empty;
    public string? EmailAddress { get; set; }
    public string? Address { get; set; }

    public ICollection<Student> Students { get; set; } = new List<Student>();
}
