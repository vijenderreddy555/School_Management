using SchoolMgmt.Domain.Enums;

namespace SchoolMgmt.Application.DTOs;

public class GuardianDto
{
    public string FullName { get; set; } = string.Empty;
    public Relationship Relationship { get; set; }
    public string MobilePhone { get; set; } = string.Empty;
    public string? EmailAddress { get; set; }
    public string? Address { get; set; }
}

public class CreateStudentDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateOnly DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public string NationalId { get; set; } = string.Empty;
    public Guid AcademicYearId { get; set; }
    public Guid GradeId { get; set; }
    public Guid SectionId { get; set; }
    public int? RollNumber { get; set; }
    public GuardianDto PrimaryGuardian { get; set; } = new();
    public string EmergencyContactNo { get; set; } = string.Empty;
    public BloodGroup BloodGroup { get; set; } = BloodGroup.Unknown;
    public string? MedicalAlerts { get; set; }
}

public class StudentResponseDto
{
    public Guid StudentId { get; set; }
    public string StudentCode { get; set; } = string.Empty;
    public int RollNumber { get; set; }
    public StudentStatus Status { get; set; }
}

public class StudentSummaryDto
{
    public Guid Id { get; set; }
    public string StudentCode { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? NationalId { get; set; }
    public string GradeName { get; set; } = string.Empty;
    public string SectionName { get; set; } = string.Empty;
    public int RollNumber { get; set; }
    public StudentStatus Status { get; set; }
    public string? MedicalAlerts { get; set; }
}

public class UpdateStudentStatusDto
{
    public StudentStatus NewStatus { get; set; }
    public Guid? TargetSectionId { get; set; }
    public string ChangeReason { get; set; } = string.Empty;
}

public class UpdateStudentStatusResultDto
{
    public Guid StudentId { get; set; }
    public StudentStatus PreviousStatus { get; set; }
    public StudentStatus NewStatus { get; set; }
}
