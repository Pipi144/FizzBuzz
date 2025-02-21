using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Interfaces;

public interface IGameService
{
    public Task<List<BasicGameDto>> GetAllGames(GetGamesParamsDto? getGamesParams);
    public Task<GameDto> GetGameById(long id);
    public Task<GameDto> AddGame(AddGameDto addGameDto);
    public Task<GameDto> UpdateGame(long id, UpdateGameDto updateGameDto);
    public Task DeleteGame(long id);
}