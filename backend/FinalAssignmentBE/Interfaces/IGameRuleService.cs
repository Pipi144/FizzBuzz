using FinalAssignmentBE.Dto;

namespace FinalAssignmentBE.Interfaces;

public interface IGameRuleService
{
    public Task<GameRuleDto> AddGameRule(AddGameRuleDto gameRule);
    public Task<GameRuleDto> EditGameRule(long updatedId, EditGameRuleDto editPayloadDto);
    public Task DeleteGameRuleById(long id);
}