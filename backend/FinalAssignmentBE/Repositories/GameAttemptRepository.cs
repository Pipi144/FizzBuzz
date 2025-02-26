using FinalAssignmentBE.Interfaces;
using FinalAssignmentBE.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalAssignmentBE.Repositories;

public class GameAttemptRepository : IGameAttemptRepository
{

    private readonly FinalAssignmentDbContext _dbContext;
    private readonly ILogger<GameAttemptRepository> _logger;

    public GameAttemptRepository(FinalAssignmentDbContext dbContext, ILogger<GameAttemptRepository> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<GameAttempt> AddGameAttempt(GameAttempt gameAttempt)
    {
        try
        {
            var result = await _dbContext.GameAttempts.AddAsync(gameAttempt);
            await _dbContext.SaveChangesAsync();
            return result.Entity;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    public async Task<GameAttempt?> GetGameAttemptById(long id)
    {
        try
        {
            var gameAttempt = await _dbContext.GameAttempts
                .Include(g => g.Game) // Ensures Game is loaded
                .Include(g => g.GameQuestions) // Ensures Questions are loaded
                .SingleOrDefaultAsync(g => g.AttemptId == id); // `.FindAsync(id)` doesn't work well with relationships
            return gameAttempt;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    public async Task<GameAttempt> UpdateGameAttempt(GameAttempt gameAttempt)
    {
        try
        {
            _dbContext.GameAttempts.Update(gameAttempt);
            await _dbContext.SaveChangesAsync();
            return gameAttempt;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}