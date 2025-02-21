using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Interfaces;

public interface IGameQuestionRepository
{
    public Task<GameQuestion?> GetGameQuestionById(long id);
    public Task<GameQuestion> UpdateGameQuestion(GameQuestion gameQuestion);
    
    public Task<GameQuestion> AddGameQuestion(GameQuestion gameQuestion);
}