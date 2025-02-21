using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Interfaces;
using FinalAssignmentBE.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalAssignmentBE.Repositories;

public class GameRepository : IGameRepository
{
    private readonly FinalAssignmentDbContext _context;
    private readonly ILogger<GameRepository> _logger;

    public GameRepository(FinalAssignmentDbContext context, ILogger<GameRepository> logger)
    {
        _context = context;
        _logger = logger;
    }


    public async Task<IEnumerable<Game>> GetAllGames(GetGamesParamsDto? getGamesParams)
    {
        try
        {
            var query = _context.Games.AsQueryable();

            if (getGamesParams != null)
            {
                if (getGamesParams.CreatedByUserId is < 0)
                    throw new ArgumentException("User Id can't be negative.");

                if (!string.IsNullOrEmpty(getGamesParams.GameName))
                {
                    query = query.Where(g => g.GameName == getGamesParams.GameName);
                }

                if (getGamesParams.CreatedByUserId.HasValue)
                {
                    query = query.Where(g => g.CreatedByUserId == getGamesParams.CreatedByUserId.Value);
                }
            }

            // Apply default ordering by CreatedAt descending
            query = query.OrderByDescending(g => g.CreatedAt);

            // For read-only operations, disable change tracking
            return await query.AsNoTracking().ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetAllGames with parameters {@GetGamesParams}", getGamesParams);
            throw;
        }
    }

    public async Task<Game?> GetGameById(long id)
    {
        if (id < 0)
            throw new ArgumentException("Game Id can't be negative.");

        try
        {
            var game = await _context.Games
                .Include(g => g.User)
                .Include(g => g.GameRules)
                .FirstOrDefaultAsync(g => g.GameId == id);

            if (game == null)
                throw new KeyNotFoundException($"Game with Id {id} not found.");

            return game;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in GetGameById for Id {GameId}", id);
            throw;
        }
    }

    public async Task<Game> AddGame(Game game)
    {
        try
        {
            var entry = await _context.Games.AddAsync(game);
            await _context.SaveChangesAsync();

            // Explicitly load the related User navigation property
            await _context.Entry(entry.Entity)
                .Reference(g => g.User)
                .LoadAsync();

            return entry.Entity;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in AddGame for game {@Game}", game);
            throw;
        }
    }

    public async Task<Game> UpdateGame(Game game)
    {
        try
        {
            _context.Games.Update(game);
            await _context.SaveChangesAsync();
            return game;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in UpdateGame for game {@Game}", game);
            throw;
        }
    }

    public async Task DeleteGame(long id)
    {
        try
        {
            var game = await _context.Games.FindAsync(id);
            if (game == null)
                throw new KeyNotFoundException($"Game with Id {id} not found.");

            _context.Games.Remove(game);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in DeleteGame for Id {GameId}", id);
            throw;
        }
    }
}