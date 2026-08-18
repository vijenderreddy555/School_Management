using AutoMapper;
using SchoolMgmt.Application.DTOs;
using SchoolMgmt.Domain.Entities;

namespace SchoolMgmt.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<GuardianDto, Guardian>();

        CreateMap<Student, StudentSummaryDto>()
            .ForMember(d => d.GradeName, o => o.MapFrom(s => s.Grade != null ? s.Grade.Name : string.Empty))
            .ForMember(d => d.SectionName, o => o.MapFrom(s => s.Section != null ? s.Section.Name : string.Empty));

        CreateMap<Student, StudentResponseDto>()
            .ForMember(d => d.StudentId, o => o.MapFrom(s => s.Id));

        CreateMap<StudentDocument, DocumentResponseDto>();
    }
}
