using Microsoft.EntityFrameworkCore;
using SchoolMgmt.Domain.Entities;

namespace SchoolMgmt.Application.Interfaces;

public interface ISchoolMgmtDbContext
{
    DbSet<AcademicYear> AcademicYears { get; }
    DbSet<Grade> Grades { get; }
    DbSet<Section> Sections { get; }
    DbSet<Guardian> Guardians { get; }
    DbSet<Student> Students { get; }
    DbSet<StudentDocument> StudentDocuments { get; }
    DbSet<StudentStatusHistory> StudentStatusHistories { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction> BeginTransactionAsync(
        System.Data.IsolationLevel isolationLevel, CancellationToken cancellationToken = default);
}
