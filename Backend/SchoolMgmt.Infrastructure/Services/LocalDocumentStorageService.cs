using Microsoft.Extensions.Configuration;
using SchoolMgmt.Application.Interfaces;

namespace SchoolMgmt.Infrastructure.Services;

/// <summary>Stores uploaded files on local disk; swap for S3/Blob storage in production.</summary>
public class LocalDocumentStorageService : IDocumentStorageService
{
    private readonly string _rootPath;
    private readonly string _publicBaseUrl;

    public LocalDocumentStorageService(IConfiguration configuration)
    {
        _rootPath = configuration["FileStorage:RootPath"] ?? "App_Data/uploads";
        _publicBaseUrl = configuration["FileStorage:PublicBaseUrl"] ?? "/uploads";
        Directory.CreateDirectory(_rootPath);
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        var safeName = $"{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var fullPath = Path.Combine(_rootPath, safeName);

        await using (var output = File.Create(fullPath))
        {
            await fileStream.CopyToAsync(output, cancellationToken);
        }

        return $"{_publicBaseUrl.TrimEnd('/')}/{safeName}";
    }
}
