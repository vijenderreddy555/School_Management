using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SchoolMgmt.Application.Common;
using SchoolMgmt.Application.DTOs;
using SchoolMgmt.Application.Interfaces;
using SchoolMgmt.Domain.Enums;
using System.Security.Claims;

namespace SchoolMgmt.Api.Controllers;

[ApiController]
[Route("api/v1/students")]
[Authorize]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _studentService;

    public StudentsController(IStudentService studentService)
    {
        _studentService = studentService;
    }

    [HttpPost]
    [Authorize(Roles = "REGISTRAR,ADMISSIONS_ADMIN,SYSTEM_ADMIN")]
    public async Task<ActionResult<StudentResponseDto>> Post([FromBody] CreateStudentDto dto, CancellationToken cancellationToken)
    {
        var result = await _studentService.CreateStudentAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(Post), new { id = result.StudentId }, result);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<StudentSummaryDto>>> Get([FromQuery] StudentQueryParameters query, CancellationToken cancellationToken)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        var maskSensitive = role == "TEACHER";
        var result = await _studentService.SearchStudentsAsync(query, maskSensitive, cancellationToken);
        return Ok(result);
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "REGISTRAR,SYSTEM_ADMIN")]
    public async Task<ActionResult<UpdateStudentStatusResultDto>> UpdateStatus(Guid id, [FromBody] UpdateStudentStatusDto dto, CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var changedByUserId = Guid.TryParse(userIdClaim, out var parsed) ? parsed : Guid.Empty;

        var result = await _studentService.UpdateStudentStatusAsync(id, dto, changedByUserId, cancellationToken);
        return Ok(result);
    }

    [HttpPost("{id:guid}/documents")]
    [Authorize(Roles = "REGISTRAR,ADMISSIONS_ADMIN,SYSTEM_ADMIN")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<ActionResult<DocumentResponseDto>> UploadDocument(Guid id, IFormFile file, [FromForm] DocumentType documentType, CancellationToken cancellationToken)
    {
        if (file.Length == 0)
        {
            return BadRequest(new { error = "A non-empty file is required." });
        }

        await using var stream = file.OpenReadStream();
        var result = await _studentService.UploadDocumentAsync(id, stream, file.FileName, file.ContentType, file.Length, documentType, cancellationToken);
        return CreatedAtAction(nameof(UploadDocument), new { id = result.Id }, result);
    }
}
