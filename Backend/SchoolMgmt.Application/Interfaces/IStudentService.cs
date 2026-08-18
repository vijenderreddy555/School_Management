using SchoolMgmt.Application.Common;
using SchoolMgmt.Application.DTOs;

namespace SchoolMgmt.Application.Interfaces;

public interface IStudentService
{
    Task<StudentResponseDto> CreateStudentAsync(CreateStudentDto dto, CancellationToken cancellationToken = default);
    Task<PagedResult<StudentSummaryDto>> SearchStudentsAsync(StudentQueryParameters query, bool maskSensitiveFields, CancellationToken cancellationToken = default);
    Task<UpdateStudentStatusResultDto> UpdateStudentStatusAsync(Guid studentId, UpdateStudentStatusDto dto, Guid changedByUserId, CancellationToken cancellationToken = default);
    Task<DocumentResponseDto> UploadDocumentAsync(Guid studentId, Stream fileStream, string fileName, string contentType, long fileSizeBytes, Domain.Enums.DocumentType documentType, CancellationToken cancellationToken = default);
}
