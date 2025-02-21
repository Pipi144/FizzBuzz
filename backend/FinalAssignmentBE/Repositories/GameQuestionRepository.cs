using FinalAssignmentBE.Interfaces;
using FinalAssignmentBE.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalAssignmentBE.Repositories;

public class GameQuestionRepository : IGameQuestionRepository
{
    private readonly FinalAssignmentDbContext _context;
    private readonly ILogger<GameQuestionRepository> _logger;

    public GameQuestionRepository(FinalAssignmentDbContext context, ILogger<GameQuestionRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<GameQuestion?> GetGameQuestionById(long id)
    {
        try
        {
            var gameQuestion = await _context.GameQuestions.Include(q => q.GameAttempt).ThenInclude(a => a.Game)
                .ThenInclude(g => g.GameRules)
                .FirstOrDefaultAsync(q => q.Id == id);
            return gameQuestion;
        }
        catch (Exception e)
        {
            _logger.LogError("Error GameQuestion Repository=> GetGameQuestionById: ", e.Message);
            throw;
        }
    }

    public async Task<GameQuestion> UpdateGameQuestion(GameQuestion gameQuestion)
    {
        try
        {
            _context.GameQuestions.Update(gameQuestion);
            await _context.SaveChangesAsync();
            return gameQuestion;
        }
        catch (Exception e)
        {
            _logger.LogError("Error GameQuestion Repository=> UpdateGameQuestion: ", e.Message);
            throw;
        }
    }

    public async Task<GameQuestion> AddGameQuestion(GameQuestion gameQuestion)
    {
        try
        {
            var res = _context.GameQuestions.Add(gameQuestion);
            await _context.SaveChangesAsync();
            return res.Entity;
        }
        catch (Exception e)
        {
            _logger.LogError("Error GameQuestion Repository=> AddGameQuestion: ", e.Message);
            throw;
        }
    }
}