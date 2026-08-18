using FluentValidation;
using SchoolMgmt.Application.DTOs;

namespace SchoolMgmt.Application.Validators;

public class GuardianDtoValidator : AbstractValidator<GuardianDto>
{
    public GuardianDtoValidator()
    {
        RuleFor(g => g.FullName).NotEmpty().MaximumLength(100).Matches(@"^[A-Za-z\s]+$")
            .WithMessage("Guardian name must contain only letters and spaces.");
        RuleFor(g => g.Relationship).IsInEnum();
        RuleFor(g => g.MobilePhone).NotEmpty().Matches(@"^\+?[1-9]\d{1,14}$")
            .WithMessage("Please enter a valid mobile phone number.");
        RuleFor(g => g.EmailAddress).EmailAddress().When(g => !string.IsNullOrWhiteSpace(g.EmailAddress));
    }
}

public class CreateStudentDtoValidator : AbstractValidator<CreateStudentDto>
{
    public CreateStudentDtoValidator()
    {
        RuleFor(s => s.FirstName).NotEmpty().MaximumLength(50).Matches(@"^[A-Za-z\s]+$");
        RuleFor(s => s.LastName).NotEmpty().MaximumLength(50).Matches(@"^[A-Za-z\s]+$");

        RuleFor(s => s.DateOfBirth)
            .Must(BeWithinValidAgeRange)
            .WithMessage("Student age must be between 3 and 20 years for the selected Academic Year.");

        RuleFor(s => s.Gender).IsInEnum();

        RuleFor(s => s.NationalId).NotEmpty().Matches(@"^[A-Z0-9-]{8,20}$")
            .WithMessage("National ID must be 8-20 characters of uppercase letters, digits, or hyphens.");

        RuleFor(s => s.AcademicYearId).NotEmpty();
        RuleFor(s => s.GradeId).NotEmpty();
        RuleFor(s => s.SectionId).NotEmpty();

        RuleFor(s => s.RollNumber).InclusiveBetween(1, 999).When(s => s.RollNumber.HasValue);

        RuleFor(s => s.PrimaryGuardian).NotNull().SetValidator(new GuardianDtoValidator());

        RuleFor(s => s.EmergencyContactNo).NotEmpty().Matches(@"^\+?[1-9]\d{1,14}$")
            .WithMessage("Please enter a valid emergency contact number.");

        RuleFor(s => s.BloodGroup).IsInEnum();
        RuleFor(s => s.MedicalAlerts).MaximumLength(500);
    }

    private static bool BeWithinValidAgeRange(DateOnly dateOfBirth)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var age = today.Year - dateOfBirth.Year;
        if (dateOfBirth > today.AddYears(-age)) age--;
        return age is >= 3 and <= 20;
    }
}

public class UpdateStudentStatusDtoValidator : AbstractValidator<UpdateStudentStatusDto>
{
    public UpdateStudentStatusDtoValidator()
    {
        RuleFor(s => s.NewStatus).IsInEnum();
        RuleFor(s => s.ChangeReason).NotEmpty().WithMessage("A change reason is required.");
    }
}
