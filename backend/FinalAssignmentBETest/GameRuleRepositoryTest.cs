using FinalAssignmentBE.Models;
using FinalAssignmentBE.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace FinalAssignmentBETest;

[TestFixture]
public class GameRuleRepositoryTest
{
    private GameRuleRepository _gameRuleRepository;
    private FinalAssignmentDbContext _dbContext;
    private Mock<ILogger<GameRuleRepository>> _mockLogger;

    [SetUp]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<FinalAssignmentDbContext>().UseInMemoryDatabase("TestDB").Options;
        _dbContext = new FinalAssignmentDbContext(options);
        _mockLogger = new Mock<ILogger<GameRuleRepository>>();
        _gameRuleRepository = new GameRuleRepository(_dbContext, _mockLogger.Object);

        // seed data
        _dbContext.GameRules.AddRange([
            new GameRule()
            {
                GameId = 1,
                DivisibleNumber = 3,
                RuleId = 1,
                ReplacedWord = "Peter"
            },
            new GameRule()
            {
                GameId = 2,
                DivisibleNumber = 4,
                RuleId = 2,
                ReplacedWord = "Mary"
            },
            new GameRule()
            {
                GameId = 1,
                DivisibleNumber = 5,
                RuleId = 3,
                ReplacedWord = "Metusela"
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
    public async Task AddGameRule_ValidGameRule_ReturnsAddedGameRule()
    {
        //Arrange
        var newGameRule = new GameRule()
        {
            RuleId = 4,
            DivisibleNumber = 3,
            ReplacedWord = "Noah",
            GameId = 1
        };

        //Act
        var result = await _gameRuleRepository.AddGameRule(newGameRule);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.GameId, Is.EqualTo(1));
        Assert.That(result.DivisibleNumber, Is.EqualTo(3));
        Assert.That(result.ReplacedWord, Is.EqualTo("Noah"));
        Assert.That(_dbContext.GameRules.Count(), Is.EqualTo(4));
    }

    [Test]
    public async Task UpdateGameRule_ValidGameRule_ReturnsUpdatedGameRule()
    {
        //Arrange
        var gameRuleToUpdate = await _dbContext.GameRules.FirstAsync(game => game.GameId == 1);
        gameRuleToUpdate.DivisibleNumber = 14;
        gameRuleToUpdate.ReplacedWord = "joseph";

        //Act
        var result = await _gameRuleRepository.UpdateGameRule(gameRuleToUpdate);

        //Assert

        Assert.That(result, Is.Not.Null);
        Assert.That(result.RuleId, Is.EqualTo(1));
        Assert.That(result.DivisibleNumber, Is.EqualTo(14));
        Assert.That(result.ReplacedWord, Is.EqualTo("joseph"));
    }

    [Test]
    public async Task GetGameRuleById_FoundGameRule_ReturnsGameRule()
    {
        // Arrange
        long gameRuleId = 1;

        //Act
        var result = await _gameRuleRepository.GetGameRuleById(gameRuleId);

        //Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.RuleId, Is.EqualTo(gameRuleId));
        Assert.That(result.DivisibleNumber, Is.EqualTo(3));
        Assert.That(result.ReplacedWord, Is.EqualTo("Peter"));
        Assert.That(result.GameId, Is.EqualTo(1));
    }
    
    [Test]
    public async Task GetGameRuleById_NotFoundGameRule_ReturnsNull()
    {
        // Arrange
        long gameRuleId = 1000;
        
        
        //Act
        var result = await _gameRuleRepository.GetGameRuleById(gameRuleId);

        //Assert
        Assert.That(result, Is.Null);

    }

    [Test]
    public async Task DeleteGameRuleById_ValidGameRule_DeletedGameRuleNotFound()
    {
        //Arrange
        var deletedGameRuleId = 1;

        //Act 
        await _gameRuleRepository.DeleteGameRuleById(deletedGameRuleId);

        //Assert
        Assert.That(_dbContext.GameRules.Count(), Is.EqualTo(2));
        Assert.That(_dbContext.GameRules.FirstOrDefault(game => game.RuleId == deletedGameRuleId), Is.Null);
    }

    [Test]
    public void DeleteGameRuleById_NotFoundGameRule_ThrowsNotFoundException()
    {
        // Arrange
        var deletedGameRuleId = 999;

        //Assert Act
        Assert.That(async () => await _gameRuleRepository.DeleteGameRuleById(deletedGameRuleId),
            Throws.TypeOf<KeyNotFoundException>().And.Message.EqualTo($"Game rule id {deletedGameRuleId} not found."));
    }
}