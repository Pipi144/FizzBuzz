using AutoMapper;
using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Mappers;

public class GameMapper : Profile
{
    public GameMapper()
    {
        // Map Game to BasicGameDto
        CreateMap<Game, BasicGameDto>();

        // Map Game to GameDto
        CreateMap<Game, GameDto>()
            .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
            .ForMember(dest => dest.GameRules, opt => opt.MapFrom(src => src.GameRules));

        // Map AddGameDto to Game
        CreateMap<AddGameDto, Game>()
            .ForMember(dest => dest.GameRules, opt => opt.MapFrom(src =>
                src.GameRules != null
                    ? src.GameRules.Select(rule => new GameRule
                    {
                        DivisibleNumber = rule.DivisibleNumber,
                        ReplacedWord = rule.ReplacedWord
                    }).ToList()
                    : new List<GameRule>()));
    }
}