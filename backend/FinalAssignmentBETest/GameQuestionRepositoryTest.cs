using FinalAssignmentBE.Models;
using FinalAssignmentBE.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace FinalAssignmentBETest;

[TestFixture]
public class GameQuestionRepositoryTest
{
    private FinalAssignmentDbContext _dbContext;
    private DbContextOptions<FinalAssignmentDbContext> _options;
    private GameQuestionRepository _gameQuestionRepository;
    private Mock<ILogger<GameQuestionRepository>> _mockLogger;

    [SetUp]
    public void Setup()
    {
        _options = new DbContextOptionsBuilder<FinalAssignmentDbContext>().UseInMemoryDatabase("TestDB").Options;
        _dbContext = new FinalAssignmentDbContext(_options);
        _mockLogger = new Mock<ILogger<GameQuestionRepository>>();
        _gameQuestionRepository = new GameQuestionRepository(_dbContext, _mockLogger.Object);

        //Seed data
        _dbContext.GameQuestions.AddRange(new List<GameQuestion>()
            {
                new GameQuestion()
                {
                    Id = 1,
                    QuestionNumber = 10,
                    UserAnswer = "Foo",
                    IsCorrectAnswer = true,
                    GameAttemptId = 1
                },
                new GameQuestion()
                {
                    Id = 2,
                    QuestionNumber = 12,
                    UserAnswer = "",
                    IsCorrectAnswer = false,
                    GameAttemptId = 1
                }
            })
            ;
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
    public async Task GetGameQuestionById_GameQuestionExists_ReturnsGameQuestion()
    {
        //Act
        var result = await _gameQuestionRepository.GetGameQuestionById(1);

        //Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Id, Is.EqualTo(1));
        Assert.That(result.QuestionNumber, Is.EqualTo(10));
        Assert.That(result.UserAnswer, Is.EqualTo("Foo"));
        Assert.That(result.IsCorrectAnswer, Is.True);
        Assert.That(result.GameAttemptId, Is.EqualTo(1));
    }

    [Test]
    public async Task GetGameQuestionById_GameQuestionDoesNotExist_ReturnsNull()
    {
        //Act
        var result = await _gameQuestionRepository.GetGameQuestionById(5);

        // Assert
        Assert.That(result, Is.Null);
    }

    [Test]
    public async Task UpdateGameQuestion_Success_ReturnsGameQuestion()
    {
        //Arrange
        var updatedGameQuestion = await _dbContext.GameQuestions.FirstAsync(q => q.Id == 2);
        updatedGameQuestion.QuestionNumber = 14;
        updatedGameQuestion.UserAnswer = "1234";
        updatedGameQuestion.IsCorrectAnswer = true;


        //Act
        var result = await _gameQuestionRepository.UpdateGameQuestion(updatedGameQuestion);

        //Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Id, Is.EqualTo(2));
        Assert.That(result.QuestionNumber, Is.EqualTo(14));
        Assert.That(result.UserAnswer, Is.EqualTo("1234"));
        Assert.That(result.IsCorrectAnswer, Is.True);
        Assert.That(result.GameAttemptId, Is.EqualTo(1));
    }

    [Test]
    public async Task AddGameQuestion_Success_ReturnsGameQuestion()
    {
        //Arrange
        var newGameQuestion = new GameQuestion()
        {
            Id = 3,
            QuestionNumber = 10,
            UserAnswer = "hehe",
            IsCorrectAnswer = true,
            GameAttemptId = 2
        };

        //Act
        var result = await _gameQuestionRepository.AddGameQuestion(newGameQuestion);

        //Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Id, Is.EqualTo(3));
        Assert.That(result.QuestionNumber, Is.EqualTo(10));
        Assert.That(result.UserAnswer, Is.EqualTo("hehe"));
        Assert.That(result.IsCorrectAnswer, Is.True);
        Assert.That(result.GameAttemptId, Is.EqualTo(2));
        Assert.That(_dbContext.GameQuestions.Count(), Is.EqualTo(3));
    }
}