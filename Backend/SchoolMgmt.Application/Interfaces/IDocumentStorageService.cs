namespace SchoolMgmt.Application.Interfaces;

public interface IDocumentStorageService
{
    /// <summary>Persists the file to storage and returns its accessible URL.</summary>
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default);
}
