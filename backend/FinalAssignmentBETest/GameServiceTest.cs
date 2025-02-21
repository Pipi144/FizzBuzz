using AutoMapper;
using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Interfaces;
using FinalAssignmentBE.Models;
using FinalAssignmentBE.Services;
using Microsoft.Extensions.Logging;
using Moq;

namespace FinalAssignmentBETest;

[TestFixture]
public class GameServiceTest
{
    private GameService _gameService;
    private Mock<ILogger<GameService>> _mockLogger;
    private Mock<IGameRepository> _mockGameRepository;
    private Mock<IMapper> _mockMapper;
    private List<Game> _games;

    [SetUp]
    public void Setup()
    {
        _mockLogger = new Mock<ILogger<GameService>>();
        _mockGameRepository = new Mock<IGameRepository>();
        _mockMapper = new Mock<IMapper>();
        _gameService = new GameService(_mockGameRepository.Object, _mockLogger.Object, _mockMapper.Object);

        _games = new List<Game>
        {
            new Game
            {
                GameId = 1,
                GameName = "Pipi's game",
                CreatedByUserId = 1,
                GameRules = new List<GameRule>
                {
                    new GameRule
                    {
                        GameId = 1,
                        RuleId = 1,
                        DivisibleNumber = 3,
                        ReplacedWord = "Pipi"
                    },
                    new GameRule
                    {
                        GameId = 1,
                        RuleId = 2,
                        DivisibleNumber = 7,
                        ReplacedWord = "mary"
                    }
                }
            },
            new Game
            {
                GameId = 2,
                GameName = "Metusela's game",
                CreatedByUserId = 2,
                GameRules = new List<GameRule>
                {
                    new GameRule
                    {
                        GameId = 2,
                        RuleId = 3,
                        DivisibleNumber = 5,
                        ReplacedWord = "Metusela"
                    }
                }
            },
            new Game
            {
                GameId = 3,
                GameName = "MK's game",
                CreatedByUserId = 1,
                GameRules = new List<GameRule>() // even if empty, this is more explicit
            }
        };
    }


    [Test]
    public async Task GetAllGames_WithoutFilters_ReturnsGameList()
    {
        //Arrange
        var expectedGameList = new List<BasicGameDto>()
        {
            new BasicGameDto()
            {
                GameId = 1,
                GameName = "Pipi's game",
                CreatedByUserId = 1,
                CreatedAt = DateTime.UtcNow
            },
            new BasicGameDto()
            {
                GameId = 2,
                GameName = "Metusela's game",
                CreatedByUserId = 2,
                CreatedAt = DateTime.UtcNow
            },
            new BasicGameDto()
            {
                GameId = 3,
                GameName = "MK's game",
                CreatedByUserId = 1, CreatedAt = DateTime.UtcNow
            }
        };
        _mockGameRepository.Setup(s => s.GetAllGames(null)).ReturnsAsync(_games);
        _mockMapper.Setup(m => m.Map<List<BasicGameDto>>(_games)).Returns(expectedGameList);
        //Act
        var result = await _gameService.GetAllGames(null);

        //Assert
        Assert.That(result.Count, Is.EqualTo(3));
    }

    [Test]
    public async Task GetAllGames_WithFilter_ReturnsMatchingGameList()
    {
        //Arrange
        var filterParams = new GetGamesParamsDto()
        {
            CreatedByUserId = 2
        };
        var expectedGameList = new List<BasicGameDto>()
        {
            new BasicGameDto()
            {
                GameId = 2,
                GameName = "Metusela's game",
                CreatedByUserId = 2,
                CreatedAt = DateTime.UtcNow
            },
        };
        var filteredGames = _games.Where(g => g.CreatedByUserId == filterParams.CreatedByUserId).ToList();

        _mockGameRepository.Setup(s => s.GetAllGames(filterParams)).ReturnsAsync(filteredGames);
        _mockMapper.Setup(m => m.Map<List<BasicGameDto>>(filteredGames)).Returns(expectedGameList);

        //Act
        var result = await _gameService.GetAllGames(filterParams);

        //Assert
        Assert.That(result.Count, Is.EqualTo(1));
        Assert.That(result.First().GameId, Is.EqualTo(2));
        Assert.That(result.First().GameName, Is.EqualTo("Metusela's game"));
    }


    [Test]
    public async Task GetAllGames_WithFilter_NoGames_ReturnsEmptyList()
    {
        //Arrange
        var filterParams = new GetGamesParamsDto()
        {
            CreatedByUserId = 99
        };
        var gamesFiltered = new List<Game>(_games.Where(g => g.CreatedByUserId == filterParams.CreatedByUserId));

        _mockGameRepository.Setup(s => s.GetAllGames(filterParams))
            .ReturnsAsync(gamesFiltered);
        _mockMapper.Setup(m => m.Map<List<BasicGameDto>>(gamesFiltered)).Returns([]);

        //Act
        var result = await _gameService.GetAllGames(filterParams);

        //Assert
        Assert.That(result.Count, Is.EqualTo(0));
    }


    [Test]
    public void GetGameById_NotFound_ThrowsNotFoundException()
    {
        //Arrange
        var gameId = 99;
        _mockGameRepository.Setup(s => s.GetGameById(gameId))
            .ThrowsAsync(new KeyNotFoundException($"Game Id {gameId} not found."));
        //Act && Assert
        Assert.That(async () => await _gameService.GetGameById(gameId),
            Throws.TypeOf<KeyNotFoundException>().And.Message.EqualTo($"Game Id {gameId} not found."));
    }

    [Test]
    public void GetGameById_InvalidId_ThrowsArgumentException()
    {
        //Arrange
        var gameId = -10;
        _mockGameRepository.Setup(s => s.GetGameById(gameId))
            .ThrowsAsync(new ArgumentException($"Game Id can't be negative."));
        //Act && Assert
        Assert.That(async () => await _gameService.GetGameById(gameId),
            Throws.TypeOf<ArgumentException>().And.Message.EqualTo($"Game Id can't be negative."));
    }

    [Test]
    public async Task GetGameById_Success_ReturnsMatchingGame()
    {
        // Arrange
        var gameId = 1;

        var expectedGame = new Game
        {
            GameId = 1,
            GameName = "Pipi's game",
            CreatedByUserId = 1,
            User = new User
            {
                UserId = 1,
                Username = "User1"
            },
            GameRules =
            [
                new GameRule { RuleId = 1, DivisibleNumber = 3, ReplacedWord = "Pipi" },
                new GameRule { RuleId = 2, DivisibleNumber = 7, ReplacedWord = "mary" }
            ]
        };

        var expectedGameDto = new GameDto
        {
            GameId = 1,
            GameName = "Pipi's game",
            CreatedByUserId = 1,
            User = new UserDto
            {
                UserId = expectedGame.User.UserId,
                Username = expectedGame.User.Username
            },
            GameRules =
            [
                new GameRuleDto { RuleId = 1, DivisibleNumber = 3, ReplacedWord = "Pipi" },
                new GameRuleDto { RuleId = 2, DivisibleNumber = 7, ReplacedWord = "mary" }
            ]
        };

        _mockGameRepository.Setup(s => s.GetGameById(gameId)).ReturnsAsync(expectedGame);
        _mockMapper.Setup(m => m.Map<GameDto>(expectedGame)).Returns(expectedGameDto);

        // Act
        var result = await _gameService.GetGameById(gameId);

        // Assert
        Assert.That(result.GameId, Is.EqualTo(expectedGameDto.GameId));
        Assert.That(result.GameName, Is.EqualTo(expectedGameDto.GameName));
        Assert.That(result.CreatedByUserId, Is.EqualTo(expectedGameDto.CreatedByUserId));
        Assert.That(result.User.Username, Is.EqualTo(expectedGameDto.User.Username));
    }

    [Test]
    public async Task AddGame_Success_ReturnsGame()
    {
        // Arrange
        var newGameDto = new AddGameDto
        {
            GameName = "New Game",
            CreatedByUserId = 1,
            GameRules = new List<BasicGameRuleDto>
            {
                new BasicGameRuleDto { DivisibleNumber = 3, ReplacedWord = "Mymarry" },
                new BasicGameRuleDto { DivisibleNumber = 13, ReplacedWord = "Milk" }
            }
        };

        var expectedNewGame = new Game
        {
            GameId = 10,
            GameName = "New Game",
            CreatedByUserId = 1,
            User = new User()
            {
                UserId = 1,
                Username = "User1",
            },
            CreatedAt = DateTime.UtcNow,
            GameRules = new List<GameRule>
            {
                new GameRule { DivisibleNumber = 3, ReplacedWord = "Mymarry", RuleId = 10, GameId = 10 },
                new GameRule { DivisibleNumber = 13, ReplacedWord = "Milk", RuleId = 11, GameId = 10 }
            }
        };

        var expectedNewGameDto = new GameDto
        {
            GameId = 10,
            GameName = expectedNewGame.GameName,
            CreatedByUserId = expectedNewGame.CreatedByUserId,
            CreatedAt = expectedNewGame.CreatedAt,
            User = new UserDto()
            {
                UserId = expectedNewGame.User.UserId,
                Username = expectedNewGame.User.Username,
            },
            GameRules = new List<GameRuleDto>
            {
                new GameRuleDto { DivisibleNumber = 3, ReplacedWord = "Mymarry", RuleId = 10 },
                new GameRuleDto { DivisibleNumber = 13, ReplacedWord = "Milk", RuleId = 11 }
            }
        };

        _mockGameRepository.Setup(s => s.AddGame(It.IsAny<Game>())).ReturnsAsync(expectedNewGame);
        _mockMapper.Setup(m => m.Map<GameDto>(It.IsAny<Game>())).Returns(expectedNewGameDto);
        _mockMapper.Setup(m => m.Map<Game>(newGameDto)).Returns(expectedNewGame);
        // Act
        var result = await _gameService.AddGame(newGameDto);

        // Assert
        Assert.That(result.GameName, Is.EqualTo(expectedNewGame.GameName));
        Assert.That(result.CreatedByUserId, Is.EqualTo(expectedNewGame.CreatedByUserId));
        Assert.That(result.GameId, Is.EqualTo(expectedNewGame.GameId));
        Assert.That(result.User.UserId, Is.EqualTo(expectedNewGame.User.UserId));
        Assert.That(result.GameRules.Count, Is.EqualTo(expectedNewGame.GameRules.Count));
    }

    [Test]
    public void AddGame_GameNameExist_ThrowsArgumentException()
    {
        // Arrange
        var newGameDto = new AddGameDto
        {
            GameName = "Pipi's game",
            CreatedByUserId = 1,
            GameRules = new List<BasicGameRuleDto>()
        };

        var getGamePayload = new GetGamesParamsDto
        {
            GameName = "Pipi's game"
        };

        // Setup the repository mock to return games that have the same name
        _mockGameRepository
            .Setup(repo => repo.GetAllGames(It.Is<GetGamesParamsDto>(p => p.GameName == "Pipi's game")))
            .ReturnsAsync(_games.Where(g => g.GameName == "Pipi's game").ToList());

        // Act & Assert
        Assert.That(async () =>
                await _gameService.AddGame(newGameDto),
            Throws.TypeOf<ArgumentException>().And.Message
                .EqualTo($"Game with name {getGamePayload.GameName} already exists."));
    }

    [Test]
    public void AddGame_GameNameEmpty_ThrowsArgumentException()
    {
        // Arrange
        var newGameDto = new AddGameDto
        {
            GameName = "",
            CreatedByUserId = 1,
            GameRules = new List<BasicGameRuleDto>()
        };

        // Act & Assert
        Assert.That(async () =>
                await _gameService.AddGame(newGameDto),
            Throws.TypeOf<ArgumentException>().And.Message
                .EqualTo("Game name cannot be empty."));
    }

    [Test]
    public void AddGame_TimeLimitInvalid_ThrowsArgumentException()
    {
        // Arrange
        var newGameDto = new AddGameDto
        {
            GameName = "hello",
            CreatedByUserId = 1,
            GameRules = new List<BasicGameRuleDto>(),
            TimeLimit = -10
        };

        // Act & Assert
        Assert.That(async () =>
                await _gameService.AddGame(newGameDto),
            Throws.TypeOf<ArgumentException>().And.Message
                .EqualTo("Time limit cannot be negative."));
    }

    [Test]
    public void AddGame_NumberRangeInvalid_ThrowsArgumentException()
    {
        // Arrange
        var newGameDto = new AddGameDto
        {
            GameName = "hello",
            CreatedByUserId = 1,
            GameRules = new List<BasicGameRuleDto>(),
            TimeLimit = 10,
            NumberRange = -100
        };

        // Act & Assert
        Assert.That(async () =>
                await _gameService.AddGame(newGameDto),
            Throws.TypeOf<ArgumentException>().And.Message
                .EqualTo("Number range cannot be negative."));
    }
    
    [Test]
    public async Task UpdateGame_Success_ReturnsGame()
    {
        // Arrange
        var updatedGame = new Game
        {
            GameId = 1,
            GameName = "Pipi's game",
            CreatedByUserId = 1,
            User = new User
            {
                UserId = 1,
                Username = "User1"
            },
            GameRules =
            [
                new GameRule { RuleId = 1, DivisibleNumber = 3, ReplacedWord = "Pipi" },
                new GameRule { RuleId = 2, DivisibleNumber = 7, ReplacedWord = "mary" }
            ]
        };
        var updatePayloadDto = new UpdateGameDto()
        {
            GameName = "Updated Game Name",
            TimeLimit = 144
        };
        var expectedGameDto = new GameDto
        {
            GameId = 1,
            GameName = updatePayloadDto.GameName,
            TimeLimit = 144,
            CreatedByUserId = 1,
            User = new UserDto
            {
                UserId = updatedGame.User.UserId,
                Username = updatedGame.User.Username
            },
            GameRules =
            [
                new GameRuleDto { RuleId = 1, DivisibleNumber = 3, ReplacedWord = "Pipi" },
                new GameRuleDto { RuleId = 2, DivisibleNumber = 7, ReplacedWord = "mary" }
            ]
        };
        _mockGameRepository.Setup(s => s.GetGameById(updatedGame.GameId)).ReturnsAsync(updatedGame);
        _mockGameRepository.Setup(s => s.UpdateGame(It.IsAny<Game>())).ReturnsAsync(updatedGame);
        _mockMapper.Setup(m => m.Map<GameDto>(It.IsAny<Game>())).Returns(expectedGameDto);

        //Act
        var result = await _gameService.UpdateGame(1, updatePayloadDto);

        //Assert
        Assert.That(result.GameId, Is.EqualTo(expectedGameDto.GameId));
        Assert.That(result.GameName, Is.EqualTo(expectedGameDto.GameName));
        Assert.That(result.TimeLimit, Is.EqualTo(expectedGameDto.TimeLimit));
    }

    [Test]
    public void UpdateGame_GameNotFound_ThrowsGameNotFoundException()
    {
        //Arrange
        var gameId = 99;
        var updatePayloadDto = new UpdateGameDto()
        {
            GameName = "Updated Game Name",
            TimeLimit = 144
        };

        _mockGameRepository.Setup(s => s.GetGameById(gameId)).ReturnsAsync(default(Game));

        //Act & Assert
        Assert.That(async () => await _gameService.UpdateGame(gameId, updatePayloadDto),
            Throws.TypeOf<KeyNotFoundException>().And.Message.EqualTo("Game not found"));
    }

    [Test]
    public void DeleteGame_GameNotFound_ThrowsGameNotFoundException()
    {
        // Arrange
        var deletedGameId = 99;
        _mockGameRepository.Setup(s => s.DeleteGame(deletedGameId))
            .ThrowsAsync(new KeyNotFoundException($"Game Id {deletedGameId} not found."));


        //Act & Assert
        Assert.That(async () => await _gameService.DeleteGame(deletedGameId),
            Throws.TypeOf<KeyNotFoundException>().And.Message.EqualTo($"Game Id {deletedGameId} not found."));
    }


    [Test]
    public async Task DeleteGame_Success_GameDeleted()
    {
        //Arrange
        var deletedGameId = 1;

        //Act 
        await _gameService.DeleteGame(deletedGameId);

        //Assert
        _mockGameRepository.Verify(s => s.DeleteGame(deletedGameId), Times.Once);
    }
}