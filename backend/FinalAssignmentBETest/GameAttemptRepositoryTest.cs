using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Models;
using FinalAssignmentBE.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace FinalAssignmentBETest;

[TestFixture]
public class GameAttemptRepositoryTest
{
    private FinalAssignmentDbContext _dbContext;
    private GameAttemptRepository _gameAttemptRepository;
    private Mock<ILogger<GameAttemptRepository>> _mockLogger;
    private DbContextOptions<FinalAssignmentDbContext> _options;

    [SetUp]
    public void Setup()
    {
        _options = new DbContextOptionsBuilder<FinalAssignmentDbContext>().UseInMemoryDatabase("TestDB").Options;
        _dbContext = new FinalAssignmentDbContext(_options);
        _mockLogger = new Mock<ILogger<GameAttemptRepository>>();
        _gameAttemptRepository = new GameAttemptRepository(_dbContext, _mockLogger.Object);

        //Seed data
        _dbContext.GameRules.AddRange(new List<GameRule>()
        {
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
            },
            new GameRule()
            {
                GameId = 2,
                RuleId = 3,
                DivisibleNumber = 5,
                ReplacedWord = "Metusela"
            }
        });
        _dbContext.Games.AddRange(new List<Game>()
        {
            new Game()
            {
                GameId = 1,
                GameName = "Pipi's game",
                CreatedByUserId = 1,
            },
            new Game()
            {
                GameId = 2,
                GameName = "Metusela's game",
                CreatedByUserId = 2,
            },
            new Game()
            {
                GameId = 3,
                GameName = "MK's game",
                CreatedByUserId = 1
            }
        });
        _dbContext.GameAttempts.AddRange([
            new GameAttempt()
            {
                GameId = 1,
                AttemptId = 1,
                Score = 0,
                AttemptedDate = DateTime.UtcNow,
                AttemptByUserId = 2
            },
            new GameAttempt()
            {
                GameId = 2,
                AttemptId = 2,
                Score = 10,
                AttemptedDate = DateTime.UtcNow,
                AttemptByUserId = 2
            }
        ]);
        _dbContext.SaveChanges();
    }

    [TearDown]
    public void TearDown()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }

    [Test]
    public async Task AddGameAttempt_Success_ReturnsAddedGameAttempt()
    {
        //Arrange
        var newAttempt = new GameAttempt()
        {
            GameId = 1,
            Score = 0,
            AttemptedDate = DateTime.UtcNow,
            AttemptByUserId = 3
        };

        //Act
        var result = await _gameAttemptRepository.AddGameAttempt(newAttempt);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result, Is.EqualTo(newAttempt));
    }

    [Test]
    public async Task GetGameAttemptById_Success_ReturnsGameAttempt()
    {
        //Arrange
        var attemptId = 1;

        //Act
        var result = await _gameAttemptRepository.GetGameAttemptById(attemptId);

        //Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.AttemptId, Is.EqualTo(1));
        Assert.That(result.GameId, Is.EqualTo(1));
        Assert.That(result.Score, Is.EqualTo(0));
        Assert.That(result.AttemptByUserId, Is.EqualTo(2));
    }

    [Test]
    public async Task GetGameAttemptByUserId_NotFound_ReturnsNull()
    {
        // Arrange
        var attemptId = 3;

        //Act
        var result = await _gameAttemptRepository.GetGameAttemptById(attemptId);

        //Assert
        Assert.That(result, Is.Null);
    }

    [Test]
    public async Task UpdateGameAttempt_UpdateScore_Success_ReturnsUpdatedGameAttempt()
    {
        //Arrange
        var updatedAttempt = await _dbContext.GameAttempts.FindAsync((long)1);
        updatedAttempt.Score = 100;

        //Act
        var result = await _gameAttemptRepository.UpdateGameAttempt(updatedAttempt);

        //Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Score, Is.EqualTo(100));
    }
}