using Microsoft.EntityFrameworkCore;
using SchoolMgmt.Domain.Entities;

namespace SchoolMgmt.Infrastructure.Persistence;

/// <summary>Seeds minimal academic master data so the admission form has selectable options out of the box.</summary>
public static class DbSeeder
{
    public static async Task SeedAsync(SchoolMgmtDbContext context)
    {
        if (!await context.AcademicYears.AnyAsync())
        {
            var academicYear = new AcademicYear
            {
                Id = Guid.NewGuid(),
                Code = "AY-2026",
                StartDate = new DateOnly(2026, 6, 1),
                EndDate = new DateOnly(2027, 3, 31),
                IsActive = true
            };
            context.AcademicYears.Add(academicYear);

            var gradeNames = new[] { "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5" };
            foreach (var (name, index) in gradeNames.Select((n, i) => (n, i)))
            {
                var grade = new Grade
                {
                    Id = Guid.NewGuid(),
                    Name = name,
                    Code = $"G{index + 1}"
                };
                context.Grades.Add(grade);

                foreach (var sectionName in new[] { "A", "B" })
                {
                    context.Sections.Add(new Section
                    {
                        Id = Guid.NewGuid(),
                        GradeId = grade.Id,
                        Name = sectionName,
                        Capacity = 40,
                        EnrolledCount = 0
                    });
                }
            }

            await context.SaveChangesAsync();
        }
    }
}
