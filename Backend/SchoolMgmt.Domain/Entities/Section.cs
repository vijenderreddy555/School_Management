namespace SchoolMgmt.Domain.Entities;

public class Section
{
    public Guid Id { get; set; }
    public Guid GradeId { get; set; }
    public Grade? Grade { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Capacity { get; set; } = 40;
    public int EnrolledCount { get; set; } = 0;

    public ICollection<Student> Students { get; set; } = new List<Student>();
}
