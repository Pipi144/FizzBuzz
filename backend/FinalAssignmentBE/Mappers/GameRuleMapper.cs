using AutoMapper;
using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Mappers;

public class GameRuleMapper : Profile
{
    public GameRuleMapper()
    {
        // Mapping BasicGameRuleDto to GameRule
        CreateMap<BasicGameRuleDto, GameRule>();

        // Mapping AddGameRuleDto to GameRule
        CreateMap<AddGameRuleDto, GameRule>();

        // Mapping GameRule to GameRuleDto
        CreateMap<GameRule, GameRuleDto>();

        // Mapping EditGameRuleDto to GameRule (for updates)
        CreateMap<EditGameRuleDto, GameRule>()
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
    }
}