namespace SchoolMgmt.Domain.Entities;

public class Grade
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;

    public ICollection<Section> Sections { get; set; } = new List<Section>();
    public ICollection<Student> Students { get; set; } = new List<Student>();
}
