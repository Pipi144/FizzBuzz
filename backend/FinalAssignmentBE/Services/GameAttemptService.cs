using System.Text.Json;
using AutoMapper;
using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Interfaces;
using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Services;

public class GameAttemptService : IGameAttemptService
{
    private readonly ILogger<GameAttemptService> _logger;
    private readonly IGameAttemptRepository _gameAttemptRepository;
    private readonly IGameQuestionRepository _gameQuestionRepository;
    private readonly IMapper _mapper;

    public GameAttemptService(ILogger<GameAttemptService> logger, IGameAttemptRepository gameAttemptRepository,
        IGameQuestionRepository gameQuestionRepository,
        IMapper mapper)
    {
        _logger = logger;
        _gameAttemptRepository = gameAttemptRepository;
        _gameQuestionRepository = gameQuestionRepository;
        _mapper = mapper;
    }


    public async Task<GameAttemptDto> CreateGameAttempt(AddGameAttemptDto payload)
    {
        try
        {
            var newGameAttempt = _mapper.Map<GameAttempt>(payload);
            var addResult = await _gameAttemptRepository.AddGameAttempt(newGameAttempt);
            if (addResult == null)
                throw new ApplicationException("Failed to add game attempt");
            return _mapper.Map<GameAttemptDto>(addResult);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    public async Task<GameAttemptDto> GetGameAttemptById(long id)
    {
        try
        {
            var foundGameAttempt = await _gameAttemptRepository.GetGameAttemptById(id);
            if (foundGameAttempt == null)
                throw new KeyNotFoundException($"Game attempt with id {id} not found");
            return _mapper.Map<GameAttemptDto>(foundGameAttempt);
        }
        catch (Exception e)
        {
            _logger.LogError("Error GameAttemptService => GetGameAttemptById", e.Message);
            throw;
        }
    }

    public async Task<GameQuestionDto> GenerateQuestion(long gameAttemptId)
    {
        try
        {
            var gameAttempt = await _gameAttemptRepository.GetGameAttemptById(gameAttemptId);
            if (gameAttempt == null)
                throw new KeyNotFoundException($"Game attempt with id {gameAttemptId} not found");
            var newQuestion = gameAttempt.GenerateQuestion();
            var resultNewQuestion = await _gameQuestionRepository.AddGameQuestion(newQuestion);
            return _mapper.Map<GameQuestionDto>(resultNewQuestion);
        }
        catch (Exception e)
        {
            _logger.LogError("Error GameAttemptService => GenerateQuestion", e.Message);
            throw;
        }
    }

    public async Task<GameQuestionDto> CheckAnswer(CheckAnswerDto payload)
    {
        try
        {
            var foundQuestion = await _gameQuestionRepository.GetGameQuestionById(payload.QuestionId);
            if (foundQuestion == null)
                throw new KeyNotFoundException($"Question with id {payload.QuestionId} not found");
            if (foundQuestion == null)
                throw new KeyNotFoundException($"Question with id {payload.QuestionId} not found");

            var gameAttempt = foundQuestion.GameAttempt;
            if (gameAttempt == null)
                throw new InvalidOperationException("GameAttempt is missing for this question");

            var game = gameAttempt.Game;
            if (game == null)
                throw new InvalidOperationException("Game is missing for this question");

            var isCorrect = game.CheckAnswer(foundQuestion.QuestionNumber, payload.Answer);

            foundQuestion.UserAnswer = payload.Answer;
            foundQuestion.IsCorrectAnswer = isCorrect;
            if (isCorrect) gameAttempt.Score += 1;
            await _gameAttemptRepository.UpdateGameAttempt(gameAttempt);
            var res = await _gameQuestionRepository.UpdateGameQuestion(foundQuestion);
            return _mapper.Map<GameQuestionDto>(res);
        }
        catch (Exception e)
        {
            _logger.LogError("Error GameAttemptService => CheckAnswer", e.Message);
            throw;
        }
    }
}