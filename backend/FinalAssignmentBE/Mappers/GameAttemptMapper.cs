using AutoMapper;
using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Mappers;

public class GameAttemptMapper : Profile
{
    public GameAttemptMapper()
    {
        // Map GameAttempt to GameAttemptDto
        CreateMap<GameAttempt, GameAttemptDto>()
            .ForMember(dest => dest.AttemptByUser, opt => opt.MapFrom(src => src.AttemptByUser))
            .ForMember(dest => dest.GameQuestions, opt => opt.MapFrom(src => src.GameQuestions));

        // Map AddGameAttemptDto to GameAttempt
        CreateMap<AddGameAttemptDto, GameAttempt>();
    }
}