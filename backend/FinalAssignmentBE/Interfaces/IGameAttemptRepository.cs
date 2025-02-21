using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Interfaces;

public interface IGameAttemptRepository
{
    public Task<GameAttempt> AddGameAttempt(GameAttempt gameAttempt);
    public Task<GameAttempt?> GetGameAttemptById(long id);
    public Task<GameAttempt> UpdateGameAttempt(GameAttempt gameAttempt);
}