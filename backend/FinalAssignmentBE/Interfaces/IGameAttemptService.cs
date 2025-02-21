using FinalAssignmentBE.Dto;

namespace FinalAssignmentBE.Interfaces;

public interface IGameAttemptService
{
    public Task<GameAttemptDto> CreateGameAttempt(AddGameAttemptDto payload);
    public Task<GameAttemptDto> GetGameAttemptById(long id);

    public Task<GameQuestionDto> GenerateQuestion(long gameAttemptId);

    public Task<GameQuestionDto> CheckAnswer(CheckAnswerDto payload);
}