using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolMgmt.Application.Interfaces;

namespace SchoolMgmt.Api.Controllers;

/// <summary>Read-only academic master data consumed by the admission form's cascading dropdowns.</summary>
[ApiController]
[Route("api/v1")]
[Authorize]
public class ReferenceDataController : ControllerBase
{
    private readonly ISchoolMgmtDbContext _context;

    public ReferenceDataController(ISchoolMgmtDbContext context)
    {
        _context = context;
    }

    [HttpGet("academic-years")]
    public async Task<IActionResult> GetAcademicYears(CancellationToken cancellationToken)
    {
        var years = await _context.AcademicYears
            .Where(a => a.IsActive)
            .OrderByDescending(a => a.StartDate)
            .Select(a => new { a.Id, a.Code, a.StartDate, a.EndDate })
            .ToListAsync(cancellationToken);
        return Ok(years);
    }

    [HttpGet("grades")]
    public async Task<IActionResult> GetGrades(CancellationToken cancellationToken)
    {
        var grades = await _context.Grades
            .OrderBy(g => g.Name)
            .Select(g => new { g.Id, g.Name, g.Code })
            .ToListAsync(cancellationToken);
        return Ok(grades);
    }

    [HttpGet("grades/{gradeId:guid}/sections")]
    public async Task<IActionResult> GetSections(Guid gradeId, CancellationToken cancellationToken)
    {
        var sections = await _context.Sections
            .Where(s => s.GradeId == gradeId)
            .OrderBy(s => s.Name)
            .Select(s => new { s.Id, s.Name, s.Capacity, s.EnrolledCount, AvailableSeats = s.Capacity - s.EnrolledCount })
            .ToListAsync(cancellationToken);
        return Ok(sections);
    }
}
