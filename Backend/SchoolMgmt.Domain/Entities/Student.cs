using SchoolMgmt.Domain.Enums;

namespace SchoolMgmt.Domain.Entities;

public class Student
{
    public Guid Id { get; set; }
    public string StudentCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public string NationalId { get; set; } = string.Empty;

    public Guid AcademicYearId { get; set; }
    public AcademicYear? AcademicYear { get; set; }

    public Guid GradeId { get; set; }
    public Grade? Grade { get; set; }

    public Guid SectionId { get; set; }
    public Section? Section { get; set; }

    public int RollNumber { get; set; }

    public Guid PrimaryGuardianId { get; set; }
    public Guardian? PrimaryGuardian { get; set; }

    public string EmergencyContactNo { get; set; } = string.Empty;
    public BloodGroup BloodGroup { get; set; } = BloodGroup.Unknown;
    public string? MedicalAlerts { get; set; }
    public StudentStatus Status { get; set; } = StudentStatus.Enrolled;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<StudentDocument> Documents { get; set; } = new List<StudentDocument>();
    public ICollection<StudentStatusHistory> StatusHistory { get; set; } = new List<StudentStatusHistory>();
}
