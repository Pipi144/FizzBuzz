using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Models;
using FinalAssignmentBE.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using NuGet.Versioning;

namespace FinalAssignmentBETest;

[TestFixture]
public class GameRepositoryTest
{
    private FinalAssignmentDbContext _dbContext;
    private DbContextOptions<FinalAssignmentDbContext> _options;
    private GameRepository _gameRepository;
    private Mock<ILogger<GameRepository>> _mockLogger;

    [SetUp]
    public void Setup()
    {
        _options = new DbContextOptionsBuilder<FinalAssignmentDbContext>().UseInMemoryDatabase("TestDB").Options;
        _dbContext = new FinalAssignmentDbContext(_options);
        _mockLogger = new Mock<ILogger<GameRepository>>();
        _gameRepository = new GameRepository(_dbContext, _mockLogger.Object);

        //Seed data
        _dbContext.Users.AddRange(new List<User>()
        {
            new User()
            {
                UserId = 1,
                Username = "TestUser1",
                Password = "password"
            },
            new User()
            {
                UserId = 2,
                Username = "TestUser2",
                Password = "password"
            }
        });

        _dbContext.Games.AddRange(new List<Game>()
        {
            new Game()
            {
                GameId = 1,
                GameName = "Pipi's game",
                CreatedByUserId = 1,
                GameRules =
                [
                    new GameRule()
                    {
                        GameId = 1,
                        RuleId = 1,
                        DivisibleNumber = 3,
                        ReplacedWord = "Pipi"
                    },

                    new GameRule()
                    {
                        GameId = 1,
                        RuleId = 2,
                        DivisibleNumber = 7,
                        ReplacedWord = "mary"
                    }
                ]
            },
            new Game()
            {
                GameId = 2,
                GameName = "Metusela's game",
                CreatedByUserId = 2,
                GameRules = new List<GameRule>()
                {
                    new GameRule()
                    {
                        GameId = 2,
                        RuleId = 3,
                        DivisibleNumber = 5,
                        ReplacedWord = "Metusela"
                    }
                }
            },
            new Game()
            {
                GameId = 3,
                GameName = "MK's game",
                CreatedByUserId = 1
            }
        });
        _dbContext.SaveChanges();
    }

    [TearDown]
    public void TearDown()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }

    [Test]
    public async Task GetAllGames_WithoutFilters_ReturnsAllGames()
    {
        //Act
        var res = await _gameRepository.GetAllGames(null);

        //Assert
        Assert.That(res.Count(), Is.EqualTo(3));
    }

    [Test]
    public async Task GetAllGames_WithFilter_NotFoundAny_ReturnsEmptyList()
    {
        //Arrange
        var payload = new GetGamesParamsDto()
        {
            CreatedByUserId = 999
        };

        //Act
        var result = await _gameRepository.GetAllGames(payload);

        // Assert
        Assert.That(result.Count(), Is.EqualTo(0));
    }

    [Test]
    public async Task GetAllGames_WithFilter_ReturnsMatchingGames()
    {
        // Arrange
        var payload = new GetGamesParamsDto()
        {
            CreatedByUserId = 1
        };


        //Act
        var result = await _gameRepository.GetAllGames(payload);

        //Assert
        Assert.That(result.Count(g => g.GameName == "Pipi's game" || g.GameName == "MK's game"), Is.EqualTo(2));
    }

    [Test]
    public void GetAllGames_WithFilter_FilterUserIdInvalid_ThrowsArgumentException()
    {
        // Arrange
        var payload = new GetGamesParamsDto()
        {
            CreatedByUserId = -1
        };

        //Act & Assert
        Assert.That(async () => await _gameRepository.GetAllGames(payload),
            Throws.TypeOf<ArgumentException>().And.Message.EqualTo("User Id can't be negative."));
    }

    [Test]
    public void GetGameById_InvalidId_ThrowsArgumentException()
    {
        //Arrange
        long gameId = -1;

        // Act and Assert
        Assert.That(async () => await _gameRepository.GetGameById(gameId),
            Throws.TypeOf<ArgumentException>().And.Message.EqualTo("Game Id can't be negative."));
    }

    [Test]
    public async Task GetGameById_NotFoundGame_ThrowsNotFoundException()
    {
        //Arrange
        long gameId = 999;

        //Act & Assert
        Assert.That(async () => await _gameRepository.GetGameById(gameId),
            Throws.TypeOf<KeyNotFoundException>().And.Message.EqualTo($"Game with Id {gameId} not found."));
    }

    [Test]
    public async Task GetGameById_FoundGame_ReturnsGame()
    {
        // Arrange
        long gameId = 1;

        //Act
        var result = await _gameRepository.GetGameById(gameId);

        //Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.GameId, Is.EqualTo(gameId));
        Assert.That(result.CreatedByUserId, Is.EqualTo(1));
        Assert.That(result.GameName, Is.EqualTo("Pipi's game"));
        Assert.That(result.GameRules.Count(), Is.EqualTo(2));
    }

    [Test]
    public async Task AddGame_ValidGame_ReturnsGame()
    {
        //Arrange
        var newGame = new Game()
        {
            GameId = 5,
            GameName = "New's game",
            CreatedByUserId = 1,
            GameRules =
            [
                new GameRule()
                {
                    GameId = 5,
                    RuleId = 7,
                    DivisibleNumber = 3,
                    ReplacedWord = "Pipi"
                },

                new GameRule()
                {
                    GameId = 5,
                    RuleId = 6,
                    DivisibleNumber = 7,
                    ReplacedWord = "mary"
                }
            ]
        };

        //Act
        var result = await _gameRepository.AddGame(newGame);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.GameId, Is.EqualTo(5));
        Assert.That(result.CreatedByUserId, Is.EqualTo(1));
        Assert.That(result.GameName, Is.EqualTo("New's game"));
        Assert.That(result.GameRules.Count(), Is.EqualTo(2));
        Assert.That(_dbContext.Games.Count(), Is.EqualTo(4));
    }

    [Test]
    public async Task UpdateGameName_ValidGame_ReturnsUpdatedGame()
    {
        //Arrange
        var gameToUpdate = await _dbContext.Games.FirstAsync(game => game.GameId == 1);
        gameToUpdate.GameName = "Updated game name";

        //Act
        var result = await _gameRepository.UpdateGame(gameToUpdate);

        //Assert

        Assert.That(result, Is.Not.Null);
        Assert.That(result.GameId, Is.EqualTo(1));
        Assert.That(result.GameName, Is.EqualTo("Updated game name"));
    }

    [Test]
    public async Task DeleteGame_ValidGame_ReturnsDeletedGame()
    {
        //Arrange
        var deletedGameId = 1;

        //Act 
        await _gameRepository.DeleteGame(deletedGameId);

        //Assert
        Assert.That(_dbContext.Games.Count(), Is.EqualTo(2));
        Assert.That(_dbContext.Games.FirstOrDefault(game => game.GameId == deletedGameId), Is.Null);
    }

    [Test]
    public void DeleteGame_NotFoundGame_ThrowsNotFoundException()
    {
        // Arrange
        var deletedGameId = 999;

        //Assert Act
        Assert.That(async () => await _gameRepository.DeleteGame(deletedGameId),
            Throws.TypeOf<KeyNotFoundException>().And.Message.EqualTo($"Game with Id {deletedGameId} not found."));
    }
}