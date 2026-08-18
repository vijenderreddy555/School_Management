using System.Data;
using AutoMapper;
using SchoolMgmt.Application.Common;
using SchoolMgmt.Application.DTOs;
using SchoolMgmt.Application.Interfaces;
using SchoolMgmt.Domain.Entities;
using SchoolMgmt.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace SchoolMgmt.Application.Services;

public class StudentService : IStudentService
{
    private readonly ISchoolMgmtDbContext _context;
    private readonly IMapper _mapper;
    private readonly IDocumentStorageService _documentStorage;

    public StudentService(ISchoolMgmtDbContext context, IMapper mapper, IDocumentStorageService documentStorage)
    {
        _context = context;
        _mapper = mapper;
        _documentStorage = documentStorage;
    }

    public async Task<StudentResponseDto> CreateStudentAsync(CreateStudentDto dto, CancellationToken cancellationToken = default)
    {
        // Serializable transaction guards roll-number allocation and section capacity against concurrent registrations.
        await using var transaction = await _context.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);

        var duplicate = await _context.Students.AnyAsync(s => s.NationalId == dto.NationalId, cancellationToken);
        if (duplicate)
        {
            throw new ConflictException("A student record with this National ID already exists.");
        }

        var section = await _context.Sections.FirstOrDefaultAsync(s => s.Id == dto.SectionId, cancellationToken)
            ?? throw new NotFoundException("Selected section was not found.");

        if (section.EnrolledCount >= section.Capacity)
        {
            throw new CapacityExceededException("Selected section has reached maximum enrollment capacity.");
        }

        var rollNumber = dto.RollNumber ?? await GetNextRollNumberAsync(dto.AcademicYearId, dto.GradeId, dto.SectionId, cancellationToken);

        var rollTaken = await _context.Students.AnyAsync(s =>
            s.AcademicYearId == dto.AcademicYearId && s.GradeId == dto.GradeId &&
            s.SectionId == dto.SectionId && s.RollNumber == rollNumber, cancellationToken);
        if (rollTaken)
        {
            throw new ConflictException("Roll Number already assigned to another student in this section.");
        }

        var guardian = _mapper.Map<Guardian>(dto.PrimaryGuardian);
        _context.Guardians.Add(guardian);

        var studentCode = await GenerateStudentCodeAsync(cancellationToken);

        var student = new Student
        {
            Id = Guid.NewGuid(),
            StudentCode = studentCode,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            NationalId = dto.NationalId,
            AcademicYearId = dto.AcademicYearId,
            GradeId = dto.GradeId,
            SectionId = dto.SectionId,
            RollNumber = rollNumber,
            PrimaryGuardian = guardian,
            EmergencyContactNo = dto.EmergencyContactNo,
            BloodGroup = dto.BloodGroup,
            MedicalAlerts = dto.MedicalAlerts,
            Status = StudentStatus.Enrolled,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Students.Add(student);

        section.EnrolledCount += 1;

        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return new StudentResponseDto
        {
            StudentId = student.Id,
            StudentCode = student.StudentCode,
            RollNumber = student.RollNumber,
            Status = student.Status
        };
    }

    private async Task<int> GetNextRollNumberAsync(Guid academicYearId, Guid gradeId, Guid sectionId, CancellationToken cancellationToken)
    {
        var maxRoll = await _context.Students
            .Where(s => s.AcademicYearId == academicYearId && s.GradeId == gradeId && s.SectionId == sectionId)
            .Select(s => (int?)s.RollNumber)
            .MaxAsync(cancellationToken);

        return (maxRoll ?? 0) + 1;
    }

    private async Task<string> GenerateStudentCodeAsync(CancellationToken cancellationToken)
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"STU-{year}-";

        var lastSequence = await _context.Students
            .Where(s => s.StudentCode.StartsWith(prefix))
            .Select(s => s.StudentCode)
            .OrderByDescending(c => c)
            .FirstOrDefaultAsync(cancellationToken);

        var nextSequence = 1;
        if (lastSequence != null && int.TryParse(lastSequence[prefix.Length..], out var parsed))
        {
            nextSequence = parsed + 1;
        }

        return $"{prefix}{nextSequence:D6}";
    }

    public async Task<PagedResult<StudentSummaryDto>> SearchStudentsAsync(StudentQueryParameters query, bool maskSensitiveFields, CancellationToken cancellationToken = default)
    {
        var students = _context.Students
            .Include(s => s.Grade)
            .Include(s => s.Section)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.SearchQuery))
        {
            var search = query.SearchQuery.Trim().ToLower();
            students = students.Where(s =>
                s.FirstName.ToLower().Contains(search) ||
                s.LastName.ToLower().Contains(search) ||
                s.StudentCode.ToLower().Contains(search) ||
                s.NationalId.ToLower().Contains(search));
        }

        if (query.GradeId.HasValue) students = students.Where(s => s.GradeId == query.GradeId);
        if (query.SectionId.HasValue) students = students.Where(s => s.SectionId == query.SectionId);
        if (query.AcademicYearId.HasValue) students = students.Where(s => s.AcademicYearId == query.AcademicYearId);
        if (!string.IsNullOrWhiteSpace(query.Status) && Enum.TryParse<StudentStatus>(query.Status, true, out var status))
        {
            students = students.Where(s => s.Status == status);
        }

        students = query.SortBy?.ToLower() switch
        {
            "lastname" => query.SortDescending ? students.OrderByDescending(s => s.LastName) : students.OrderBy(s => s.LastName),
            "rollnumber" => query.SortDescending ? students.OrderByDescending(s => s.RollNumber) : students.OrderBy(s => s.RollNumber),
            _ => query.SortDescending ? students.OrderByDescending(s => s.FirstName) : students.OrderBy(s => s.FirstName)
        };

        var totalCount = await students.CountAsync(cancellationToken);

        var pageNumber = Math.Max(1, query.PageNumber);
        var pageSize = Math.Clamp(query.PageSize, 1, 200);

        var items = await students
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var summaries = _mapper.Map<List<StudentSummaryDto>>(items);

        if (maskSensitiveFields)
        {
            foreach (var s in summaries)
            {
                s.NationalId = "****";
                s.MedicalAlerts = null;
            }
        }

        return new PagedResult<StudentSummaryDto>
        {
            Items = summaries,
            PageNumber = pageNumber,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<UpdateStudentStatusResultDto> UpdateStudentStatusAsync(Guid studentId, UpdateStudentStatusDto dto, Guid changedByUserId, CancellationToken cancellationToken = default)
    {
        await using var transaction = await _context.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);

        var student = await _context.Students
            .Include(s => s.Section)
            .FirstOrDefaultAsync(s => s.Id == studentId, cancellationToken)
            ?? throw new NotFoundException("Student not found.");

        var previousStatus = student.Status;
        var previousSectionId = student.SectionId;

        if (dto.TargetSectionId.HasValue && dto.TargetSectionId.Value != student.SectionId)
        {
            var targetSection = await _context.Sections.FirstOrDefaultAsync(s => s.Id == dto.TargetSectionId.Value, cancellationToken)
                ?? throw new NotFoundException("Target section not found.");

            if (targetSection.EnrolledCount >= targetSection.Capacity)
            {
                throw new CapacityExceededException("Target section has reached maximum enrollment capacity.");
            }

            if (student.Section != null)
            {
                student.Section.EnrolledCount = Math.Max(0, student.Section.EnrolledCount - 1);
            }

            targetSection.EnrolledCount += 1;
            student.SectionId = targetSection.Id;
        }

        student.Status = dto.NewStatus;
        student.UpdatedAt = DateTime.UtcNow;

        // Release the seat when a student leaves active enrollment without an explicit section transfer.
        if (!dto.TargetSectionId.HasValue && IsExitStatus(dto.NewStatus) && !IsExitStatus(previousStatus) && student.Section != null)
        {
            student.Section.EnrolledCount = Math.Max(0, student.Section.EnrolledCount - 1);
        }

        _context.StudentStatusHistories.Add(new StudentStatusHistory
        {
            Id = Guid.NewGuid(),
            StudentId = student.Id,
            PreviousStatus = previousStatus,
            NewStatus = dto.NewStatus,
            ChangeReason = dto.ChangeReason,
            ChangedByUserId = changedByUserId,
            Timestamp = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return new UpdateStudentStatusResultDto
        {
            StudentId = student.Id,
            PreviousStatus = previousStatus,
            NewStatus = student.Status
        };
    }

    private static bool IsExitStatus(StudentStatus status) =>
        status is StudentStatus.Transferred or StudentStatus.Suspended or StudentStatus.Graduated or StudentStatus.Inactive;

    public async Task<DocumentResponseDto> UploadDocumentAsync(Guid studentId, Stream fileStream, string fileName, string contentType, long fileSizeBytes, DocumentType documentType, CancellationToken cancellationToken = default)
    {
        const long maxSizeBytes = 5 * 1024 * 1024;
        var allowedExtensions = new[] { ".pdf", ".png", ".jpeg", ".jpg" };

        if (fileSizeBytes > maxSizeBytes)
        {
            throw new Application.Common.ApplicationException("File exceeds the maximum allowed size of 5 MB.");
        }

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            throw new Application.Common.ApplicationException("Unsupported file type. Allowed types: PDF, PNG, JPEG.");
        }

        var studentExists = await _context.Students.AnyAsync(s => s.Id == studentId, cancellationToken);
        if (!studentExists)
        {
            throw new NotFoundException("Student not found.");
        }

        var fileUrl = await _documentStorage.SaveFileAsync(fileStream, fileName, contentType, cancellationToken);

        var document = new StudentDocument
        {
            Id = Guid.NewGuid(),
            StudentId = studentId,
            DocumentType = documentType,
            FileUrl = fileUrl,
            FileSizeMb = Math.Round(fileSizeBytes / 1024m / 1024m, 2),
            UploadedAt = DateTime.UtcNow
        };

        _context.StudentDocuments.Add(document);
        await _context.SaveChangesAsync(cancellationToken);

        return _mapper.Map<DocumentResponseDto>(document);
    }
}
