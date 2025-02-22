using FinalAssignmentBE.Interfaces;
using FinalAssignmentBE.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalAssignmentBE.Repositories;

public class GameRuleRepository : IGameRuleRepository
{
    private readonly FinalAssignmentDbContext _context;
    private readonly ILogger<GameRuleRepository> _logger;

    public GameRuleRepository(FinalAssignmentDbContext context, ILogger<GameRuleRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<GameRule> AddGameRule(GameRule gameRule)
    {
        try
        {
            var result = await _context.GameRules.AddAsync(gameRule);
            await _context.SaveChangesAsync();
            return result.Entity;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    public async Task<GameRule> UpdateGameRule(GameRule gameRule)
    {
        try
        {
            _context.GameRules.Update(gameRule);
            await _context.SaveChangesAsync();
            return gameRule;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    public async Task<GameRule?> GetGameRuleById(long id)
    {
        try
        {
            var result = await _context.GameRules.SingleOrDefaultAsync(r => r.RuleId == id);

            return result;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    public async Task DeleteGameRuleById(long id)
    {
        try
        {
            var ruleToDelete = await _context.GameRules.FindAsync(id);
            if (ruleToDelete is null)
                throw new KeyNotFoundException($"Game rule id {id} not found.");
            _context.GameRules.Remove(ruleToDelete);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }
}