namespace SchoolMgmt.Domain.Entities;

public class AcademicYear
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Student> Students { get; set; } = new List<Student>();
}
