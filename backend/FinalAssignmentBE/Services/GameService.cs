using AutoMapper;
using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Interfaces;
using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Services;

public class GameService : IGameService
{
    private readonly IGameRepository _gameRepository;
    private readonly ILogger<GameService> _logger;
    private readonly IMapper _mapper;

    public GameService(IGameRepository gameRepository, ILogger<GameService> logger, IMapper mapper)
    {
        _gameRepository = gameRepository;
        _logger = logger;
        _mapper = mapper;
    }


    public async Task<List<BasicGameDto>> GetAllGames(GetGamesParamsDto? getGamesParams)
    {
        try
        {
            var games = await _gameRepository.GetAllGames(getGamesParams);
            return _mapper.Map<List<BasicGameDto>>(games);
        }
        catch (Exception e)
        {
            _logger.LogError("Error Game Service GetAllGames: {Message}", e.Message);
            throw;
        }
    }

    public async Task<GameDto> GetGameById(long id)
    {
        try
        {
            var game = await _gameRepository.GetGameById(id);
            return _mapper.Map<GameDto>(game);
        }
        catch (Exception e)
        {
            _logger.LogError("Error Game Service GetGameById: {Message}", e.Message);
            throw;
        }
    }

    public async Task<GameDto> AddGame(AddGameDto addGameDto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(addGameDto.GameName))
                throw new ArgumentException("Game name cannot be empty.");

            if (addGameDto.TimeLimit < 0)
                throw new ArgumentException("Time limit cannot be negative.");

            if (addGameDto.NumberRange < 0) throw new ArgumentException("Number range cannot be negative.");

            var gamesWithMatchingName = await _gameRepository.GetAllGames(new GetGamesParamsDto()
            {
                GameName = addGameDto.GameName
            });
            if (gamesWithMatchingName.Any())
                throw new ArgumentException($"Game with name {addGameDto.GameName} already exists.");
            var game = _mapper.Map<Game>(addGameDto);

            if (game.GameRules.Any())
            {
                foreach (var rule in game.GameRules)
                {
                    rule.Game = game;
                }
            }
            else
            {
                game.GameRules = new List<GameRule>();
            }

            var newGame = await _gameRepository.AddGame(game);
            return _mapper.Map<GameDto>(newGame);
        }
        catch (ArgumentException ex)
        {
            _logger.LogError("Validation Error in Game Service AddGame: {Message}", ex.Message);
            throw;
        }

        catch (Exception e)
        {
            _logger.LogError("Error in Game Service AddGame: {Message}", e.Message);
            throw;
        }
    }

    public async Task<GameDto> UpdateGame(long id, UpdateGameDto updateGameDto)
    {
        try
        {
            var foundGame = await _gameRepository.GetGameById(id);
            if (foundGame == null)
                throw new KeyNotFoundException("Game not found");
            if (!string.IsNullOrEmpty(updateGameDto.GameName))
                foundGame.GameName = updateGameDto.GameName;
            if (updateGameDto.TimeLimit.HasValue)
                foundGame.TimeLimit = updateGameDto.TimeLimit.Value;
            if (updateGameDto.NumberRange.HasValue)
                foundGame.NumberRange = updateGameDto.NumberRange.Value;
            var updatedGame = await _gameRepository.UpdateGame(foundGame);
            return _mapper.Map<GameDto>(updatedGame);
        }
        catch (Exception e)
        {
            _logger.LogError("Error Game Service UpdateGame:", e.Message);
            throw;
        }
    }

    public async Task DeleteGame(long id)
    {
        try
        {
            await _gameRepository.DeleteGame(id);
        }
        catch (Exception e)
        {
            _logger.LogError("Error Game Service DeleteGame:", e.Message);
            throw;
        }
    }
}