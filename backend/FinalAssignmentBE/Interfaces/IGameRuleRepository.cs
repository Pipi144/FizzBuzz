using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Interfaces;

public interface IGameRuleRepository
{
    public Task<GameRule> AddGameRule(GameRule gameRule);
    public Task<GameRule> UpdateGameRule(GameRule gameRule);
    public Task<GameRule?> GetGameRuleById(long id);
    public Task DeleteGameRuleById(long id);
}