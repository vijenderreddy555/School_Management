using System.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using SchoolMgmt.Application.Interfaces;
using SchoolMgmt.Domain.Entities;

namespace SchoolMgmt.Infrastructure.Persistence;

public class SchoolMgmtDbContext : DbContext, ISchoolMgmtDbContext
{
    public SchoolMgmtDbContext(DbContextOptions<SchoolMgmtDbContext> options) : base(options) { }

    public DbSet<AcademicYear> AcademicYears => Set<AcademicYear>();
    public DbSet<Grade> Grades => Set<Grade>();
    public DbSet<Section> Sections => Set<Section>();
    public DbSet<Guardian> Guardians => Set<Guardian>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<StudentDocument> StudentDocuments => Set<StudentDocument>();
    public DbSet<StudentStatusHistory> StudentStatusHistories => Set<StudentStatusHistory>();

    public async Task<IDbContextTransaction> BeginTransactionAsync(IsolationLevel isolationLevel, CancellationToken cancellationToken = default)
        => await Database.BeginTransactionAsync(isolationLevel, cancellationToken);

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(SchoolMgmtDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
