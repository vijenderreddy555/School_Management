using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SchoolMgmt.Application.Interfaces;
using SchoolMgmt.Infrastructure.Persistence;
using SchoolMgmt.Infrastructure.Services;

namespace SchoolMgmt.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<SchoolMgmtDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<ISchoolMgmtDbContext>(provider => provider.GetRequiredService<SchoolMgmtDbContext>());
        services.AddScoped<IDocumentStorageService, LocalDocumentStorageService>();

        return services;
    }
}
