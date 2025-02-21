using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Interfaces;

public interface IGameRepository
{
    public Task<IEnumerable<Game>> GetAllGames(GetGamesParamsDto? getGamesParams);
    public Task<Game?> GetGameById(long id);
    public Task<Game> AddGame(Game game);
    public Task<Game> UpdateGame(Game game);
    public Task DeleteGame(long id);
    
    
}