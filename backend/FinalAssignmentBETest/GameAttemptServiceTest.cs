using AutoMapper;
using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Interfaces;
using FinalAssignmentBE.Models;
using FinalAssignmentBE.Services;
using Microsoft.Extensions.Logging;
using Moq;

namespace FinalAssignmentBETest;

[TestFixture]
public class GameAttemptServiceTest
{
    private Mock<IGameAttemptRepository> _mockGameAttemptRepository;
    private Mock<IGameQuestionRepository> _mockGameQuestionRepository;
    private GameAttemptService _gameAttemptService;
    private Mock<IMapper> _mockMapper;
    private Mock<ILogger<GameAttemptService>> _mockLogger;

    [SetUp]
    public void Setup()
    {
        _mockGameAttemptRepository = new Mock<IGameAttemptRepository>();
        _mockGameQuestionRepository = new Mock<IGameQuestionRepository>();
        _mockMapper = new Mock<IMapper>();
        _mockLogger = new Mock<ILogger<GameAttemptService>>();
        _gameAttemptService =
            new GameAttemptService(_mockLogger.Object, _mockGameAttemptRepository.Object,
                _mockGameQuestionRepository.Object, _mockMapper.Object);
    }

    [Test]
    public async Task CreateGameAttempt_Success_ReturnsGameAttempt()
    {
        //Arrange
        var payload = new AddGameAttemptDto()
        {
            GameId = 1,
            AttemptByUserId = 2
        };
        var exptectedNewGameAttemptDto = new GameAttemptDto()
        {
            AttemptId = 1,
            GameId = 1,
            Score = 100,
            AttemptedDate = DateTime.UtcNow,
            AttemptByUserId = 2
        };
        var expectedNewGameAttempt = new GameAttempt()
        {
            AttemptId = 1,
            Score = 100,
            AttemptedDate = DateTime.UtcNow,
            AttemptByUserId = 2,
            GameId = 1,
        };
        _mockGameAttemptRepository.Setup(s => s.AddGameAttempt(It.IsAny<GameAttempt>()))
            .ReturnsAsync(expectedNewGameAttempt);
        _mockMapper.Setup(m => m.Map<GameAttemptDto>(It.IsAny<GameAttempt>())).Returns(exptectedNewGameAttemptDto);
        _mockMapper.Setup(m => m.Map<GameAttempt>(payload)).Returns(expectedNewGameAttempt);
        //Act
        var res = await _gameAttemptService.CreateGameAttempt(payload);

        //Assert
        Assert.That(res, Is.EqualTo(exptectedNewGameAttemptDto));
    }

    [Test]
    public void CreateGameAttempt_Failed_ThrowApplicationException()
    {
        //Arrange
        var payload = new AddGameAttemptDto()
        {
            GameId = 1,
            AttemptByUserId = 2
        };
        var expectedNewGameAttempt = new GameAttempt()
        {
            AttemptId = 1,
            Score = 100,
            AttemptedDate = DateTime.UtcNow,
            AttemptByUserId = 2,
            GameId = 1,
        };
        _mockGameAttemptRepository.Setup(s => s.AddGameAttempt(It.IsAny<GameAttempt>()));
        _mockMapper.Setup(m => m.Map<GameAttempt>(payload)).Returns(expectedNewGameAttempt);

        //Act and Assert
        Assert.That(async () => await _gameAttemptService.CreateGameAttempt(payload),
            Throws.TypeOf<ApplicationException>().And.Message.EqualTo("Failed to add game attempt"));
    }

    [Test]
    public void GetGameAttemptById_NotFound_ThrowsKeyNotFoundException()
    {
        //Arrange
        var attemptId = 99;
        _mockGameAttemptRepository.Setup(s => s.GetGameAttemptById(attemptId));

        // Act and Assert
        Assert.That(async () => await _gameAttemptService.GetGameAttemptById(attemptId),
            Throws.TypeOf<KeyNotFoundException>().And.Message.EqualTo($"Game attempt with id {attemptId} not found"));
    }

    [Test]
    public async Task GetGameAttemptById_Success_ReturnsGameAttempt()
    {
        //Arrange
        var attemptId = 1;
        var exptectedNewGameAttemptDto = new GameAttemptDto()
        {
            AttemptId = attemptId,
            GameId = 1,
            Score = 100,
            AttemptedDate = DateTime.UtcNow,
            AttemptByUserId = 2
        };
        var expectedNewGameAttempt = new GameAttempt()
        {
            AttemptId = attemptId,
            Score = 100,
            AttemptedDate = DateTime.UtcNow,
            AttemptByUserId = 2,
            GameId = 1,
        };
        _mockGameAttemptRepository.Setup(s => s.GetGameAttemptById(attemptId))
            .ReturnsAsync(expectedNewGameAttempt);
        _mockMapper.Setup(m => m.Map<GameAttemptDto>(It.IsAny<GameAttempt>())).Returns(exptectedNewGameAttemptDto);

        //Act 
        var res = await _gameAttemptService.GetGameAttemptById(attemptId);

        //Assert
        Assert.That(res, Is.EqualTo(exptectedNewGameAttemptDto));
    }

    [Test]
    public async Task GenerateQuestion_Success_ReturnsQuestion()
    {
        // Arrange
        var attemptId = 1;
        var expectedNewGameAttempt = new GameAttempt()
        {
            AttemptId = 1,
            Score = 100,
            AttemptedDate = DateTime.UtcNow,
            AttemptByUserId = 2,
            GameId = 1,
            Game = new Game()
            {
                GameId = 1,
                GameName = "Hello",
                TimeLimit = 0,
                NumberRange = 100,
                CreatedAt = DateTime.Now,
                CreatedByUserId = 2
            }
        };
        var newQuestion = new GameQuestion()
        {
            Id = 2,
            QuestionNumber = 22,
            UserAnswer = "",
            GameAttemptId = 1,
            IsCorrectAnswer = false
        };
        var newQuestionDto = new GameQuestionDto()
        {
            Id = 2,
            QuestionNumber = 22,
            UserAnswer = "",
            GameAttemptId = 1,
            IsCorrectAnswer = false
        };
        _mockGameAttemptRepository.Setup(s => s.GetGameAttemptById(attemptId))
            .ReturnsAsync(expectedNewGameAttempt);
        _mockGameQuestionRepository.Setup(s => s.AddGameQuestion(It.IsAny<GameQuestion>()))
            .ReturnsAsync(newQuestion);

        _mockMapper.Setup(m => m.Map<GameQuestionDto>(It.IsAny<GameQuestion>())).Returns(newQuestionDto);

        // Act
        var res = await _gameAttemptService.GenerateQuestion(attemptId);

        // Assert
        Assert.That(res, Is.EqualTo(newQuestionDto));
    }

    [Test]
    public void GenerateQuestion_GameAttemptNotFound_ThrowKeyNotFoundException()
    {
        //Arrange
        var attemptId = 1000;
        _mockGameAttemptRepository.Setup(s => s.GetGameAttemptById(attemptId));

        //Act and Assert
        Assert.That(async () => await _gameAttemptService.GenerateQuestion(attemptId),
            Throws.TypeOf<KeyNotFoundException>().And.Message.EqualTo($"Game attempt with id {attemptId} not found"));
    }

    [Test]
    public void CheckAnswer_QuestionNotFound_ThrowKeyNotFoundException()
    {
        // Arrange
        var payload = new CheckAnswerDto()
        {
            QuestionId = 99,
            Answer = "1234"
        };
        _mockGameQuestionRepository.Setup(s => s.GetGameQuestionById(payload.QuestionId));

        //Act and Assert
        Assert.That(async () => await _gameAttemptService.CheckAnswer(payload),
            Throws.TypeOf<KeyNotFoundException>().And.Message
                .EqualTo($"Question with id {payload.QuestionId} not found"));
    }

    [Test]
    public async Task CheckAnswer_MatchOneRule_AnswerCorrect_IncreaseAttemptScoreAndReturnsUpdatedQuestion()
    {
        // Arrange
        var checkPayload = new CheckAnswerDto()
        {
            QuestionId = 1,
            Answer = "bar"
        };
        var mockGame = new Game()
        {
            GameId = 1,
            GameName = "Hello",
            TimeLimit = 0,
            NumberRange = 100,
            CreatedAt = DateTime.Now,
            CreatedByUserId = 2,
            GameRules = new List<GameRule>()
            {
                new GameRule()
                {
                    GameId = 1,
                    DivisibleNumber = 11,
                    ReplacedWord = "foo",
                    RuleId = 1
                },
                new GameRule()
                {
                    GameId = 1,
                    DivisibleNumber = 15,
                    ReplacedWord = "bar",
                    RuleId = 2
                }
            }
        };

        var gameAttempt = new GameAttempt()
        {
            AttemptId = 1,
            Score = 0,
            AttemptedDate = DateTime.UtcNow,
            AttemptByUserId = 2,
            GameId = 1,
            Game = mockGame,
        };
        var expectedQuestion = new GameQuestion()
        {
            QuestionNumber = 15,
            GameAttemptId = 1,
            GameAttempt = gameAttempt,
            IsCorrectAnswer = false,
            UserAnswer = "", Id = 1
        };
        var isCorrectAnswer = mockGame.CheckAnswer(expectedQuestion.QuestionNumber, checkPayload.Answer);
        var updatedQuestionDto = new GameQuestionDto()
        {
            Id = 1,
            GameAttemptId = 1,
            IsCorrectAnswer = isCorrectAnswer,
            UserAnswer = checkPayload.Answer
        };

        _mockGameQuestionRepository.Setup(s => s.GetGameQuestionById(checkPayload.QuestionId))
            .ReturnsAsync(expectedQuestion);
        _mockMapper.Setup(m => m.Map<GameQuestionDto>(It.IsAny<GameQuestion>())).Returns(updatedQuestionDto);

        //Act
        var res = await _gameAttemptService.CheckAnswer(checkPayload);

        //Assert
        Assert.That(res, Is.EqualTo(updatedQuestionDto));

        // Verify that UpdateGameAttempt was called with the updated attempt
        _mockGameAttemptRepository.Verify(
            s => s.UpdateGameAttempt(It.Is<GameAttempt>(g => g.AttemptId == 1 && g.Score == 1)),
            Times.Once);
        _mockGameQuestionRepository.Verify(
            s => s.UpdateGameQuestion(It.Is<GameQuestion>(q =>
                q.Id == expectedQuestion.Id && q.IsCorrectAnswer == isCorrectAnswer &&
                q.UserAnswer == checkPayload.Answer)),
            Times.Once);
    }

    [Test]
    public async Task CheckAnswer_MatchOneRule_AnswerIncorrect_KeepAttemptScoreAndReturnsUpdatedQuestion()
    {
        // Arrange
        var checkPayload = new CheckAnswerDto()
        {
            QuestionId = 1,
            Answer = "foo"
        };
        var mockGame = new Game()
        {
            GameId = 1,
            GameName = "Hello",
            TimeLimit = 0,
            NumberRange = 100,
            CreatedAt = DateTime.Now,
            CreatedByUserId = 2,
            GameRules = new List<GameRule>()
            {
                new GameRule()
                {
                    GameId = 1,
                    DivisibleNumber = 11,
                    ReplacedWord = "foo",
                    RuleId = 1
                },
                new GameRule()
                {
                    GameId = 1,
                    DivisibleNumber = 15,
                    ReplacedWord = "bar",
                    RuleId = 2
                }
            }
        };

        var gameAttempt = new GameAttempt()
        {
            AttemptId = 1,
            Score = 0,
            AttemptedDate = DateTime.UtcNow,
            AttemptByUserId = 2,
            GameId = 1,
            Game = mockGame,
        };
        var expectedQuestion = new GameQuestion()
        {
            QuestionNumber = 15,
            GameAttemptId = 1,
            GameAttempt = gameAttempt,
            IsCorrectAnswer = false,
            UserAnswer = "", Id = 1
        };
        var isCorrectAnswer = mockGame.CheckAnswer(expectedQuestion.QuestionNumber, checkPayload.Answer);
        var updatedQuestionDto = new GameQuestionDto()
        {
            Id = 1,
            GameAttemptId = 1,
            IsCorrectAnswer = isCorrectAnswer,
            UserAnswer = checkPayload.Answer
        };
        _mockGameQuestionRepository.Setup(s => s.GetGameQuestionById(checkPayload.QuestionId))
            .ReturnsAsync(expectedQuestion);
        _mockMapper.Setup(m => m.Map<GameQuestionDto>(It.IsAny<GameQuestion>())).Returns(updatedQuestionDto);

        //Act
        var res = await _gameAttemptService.CheckAnswer(checkPayload);

        //Assert
        Assert.That(res, Is.EqualTo(updatedQuestionDto));

        // Verify that UpdateGameAttempt was called with the updated attempt
        _mockGameAttemptRepository.Verify(
            s => s.UpdateGameAttempt(It.Is<GameAttempt>(g => g.AttemptId == 1 && g.Score == 0)),
            Times.Once);
        _mockGameQuestionRepository.Verify(
            s => s.UpdateGameQuestion(It.Is<GameQuestion>(q =>
                q.Id == expectedQuestion.Id && q.IsCorrectAnswer == isCorrectAnswer &&
                q.UserAnswer == checkPayload.Answer)),
            Times.Once);
    }

    [Test]
    public async Task CheckAnswer_MatchMultipleRules_AnswerCorrect_IncreaseAttemptScoreAndReturnsUpdatedQuestion()
    {
        // Arrange
        var checkPayload = new CheckAnswerDto()
        {
            QuestionId = 1,
            Answer = "barFoo"
        };
        var mockGame = new Game()
        {
            GameId = 1,
            GameName = "Hello",
            TimeLimit = 0,
            NumberRange = 100,
            CreatedAt = DateTime.Now,
            CreatedByUserId = 2,
            GameRules = new List<GameRule>()
            {
                new GameRule()
                {
                    GameId = 1,
                    DivisibleNumber = 11,
                    ReplacedWord = "foo",
                    RuleId = 1
                },
                new GameRule()
                {
                    GameId = 1,
                    DivisibleNumber = 15,
                    ReplacedWord = "bar",
                    RuleId = 2
                }
            }
        };

        var gameAttempt = new GameAttempt()
        {
            AttemptId = 1,
            Score = 0,
            AttemptedDate = DateTime.UtcNow,
            AttemptByUserId = 2,
            GameId = 1,
            Game = mockGame,
        };
        var expectedQuestion = new GameQuestion()
        {
            QuestionNumber = 165,
            GameAttemptId = 1,
            GameAttempt = gameAttempt,
            IsCorrectAnswer = false,
            UserAnswer = "", Id = 1
        };
        var isCorrectAnswer = mockGame.CheckAnswer(expectedQuestion.QuestionNumber, checkPayload.Answer);

        var updatedQuestionDto = new GameQuestionDto()
        {
            Id = 1,
            GameAttemptId = 1,
            IsCorrectAnswer = isCorrectAnswer,
            UserAnswer = checkPayload.Answer
        };
        _mockGameQuestionRepository.Setup(s => s.GetGameQuestionById(checkPayload.QuestionId))
            .ReturnsAsync(expectedQuestion);

        _mockMapper.Setup(m => m.Map<GameQuestionDto>(It.IsAny<GameQuestion>())).Returns(updatedQuestionDto);

        //Act
        var res = await _gameAttemptService.CheckAnswer(checkPayload);

        //Assert
        Assert.That(res, Is.EqualTo(updatedQuestionDto));

        // Verify that UpdateGameAttempt was called with the updated attempt
        _mockGameAttemptRepository.Verify(
            s => s.UpdateGameAttempt(It.Is<GameAttempt>(g =>
                g.AttemptId == 1 && g.Score == 1)),
            Times.Once);
        _mockGameQuestionRepository.Verify(
            s => s.UpdateGameQuestion(It.Is<GameQuestion>(q =>
                q.Id == expectedQuestion.Id && q.IsCorrectAnswer == isCorrectAnswer && q.UserAnswer == checkPayload.Answer)),
            Times.Once);
    }

    [Test]
    public async Task CheckAnswer_MatchMultipleRules_AnswerIncorrect_KeepAttemptScoreAndReturnsUpdatedQuestion()
    {
        // Arrange
        var checkPayload = new CheckAnswerDto()
        {
            QuestionId = 1,
            Answer = "165"
        };
        var mockGame = new Game()
        {
            GameId = 1,
            GameName = "Hello",
            TimeLimit = 0,
            NumberRange = 100,
            CreatedAt = DateTime.Now,
            CreatedByUserId = 2,
            GameRules = new List<GameRule>()
            {
                new GameRule()
                {
                    GameId = 1,
                    DivisibleNumber = 11,
                    ReplacedWord = "foo",
                    RuleId = 1
                },
                new GameRule()
                {
                    GameId = 1,
                    DivisibleNumber = 15,
                    ReplacedWord = "bar",
                    RuleId = 2
                }
            }
        };

        var gameAttempt = new GameAttempt()
        {
            AttemptId = 1,
            Score = 0,
            AttemptedDate = DateTime.UtcNow,
            AttemptByUserId = 2,
            GameId = 1,
            Game = mockGame,
        };
        var expectedQuestion = new GameQuestion()
        {
            QuestionNumber = 165,
            GameAttemptId = 1,
            GameAttempt = gameAttempt,
            IsCorrectAnswer = false,
            UserAnswer = "", Id = 1
        };
        var isCorrectAnswer = mockGame.CheckAnswer(expectedQuestion.QuestionNumber, checkPayload.Answer);


        var updatedQuestionDto = new GameQuestionDto()
        {
            Id = 1,
            GameAttemptId = 1,
            IsCorrectAnswer = isCorrectAnswer,
            UserAnswer = checkPayload.Answer
        };
        _mockGameQuestionRepository.Setup(s => s.GetGameQuestionById(checkPayload.QuestionId))
            .ReturnsAsync(expectedQuestion);

        _mockMapper.Setup(m => m.Map<GameQuestionDto>(It.IsAny<GameQuestion>())).Returns(updatedQuestionDto);

        //Act
        var res = await _gameAttemptService.CheckAnswer(checkPayload);

        //Assert
        Assert.That(res, Is.EqualTo(updatedQuestionDto));

        // Verify that UpdateGameAttempt was called with the updated attempt
        _mockGameAttemptRepository.Verify(
            s => s.UpdateGameAttempt(It.Is<GameAttempt>(g =>
                g.AttemptId == 1 && g.Score == 0)),
            Times.Once);
        _mockGameQuestionRepository.Verify(
            s => s.UpdateGameQuestion(It.Is<GameQuestion>(q =>
                q.Id == expectedQuestion.Id && q.IsCorrectAnswer == isCorrectAnswer && q.UserAnswer == checkPayload.Answer)),
            Times.Once);
    }

    [Test]
    public async Task CheckAnswer_NoRuleMatch_AnswerCorrect_IncreaseAttemptScoreAndReturnsUpdatedQuestion()
    {
        // Arrange
        var checkPayload = new CheckAnswerDto()
        {
            QuestionId = 1,
            Answer = "12"
        };
        var mockGame = new Game()
        {
            GameId = 1,
            GameName = "Hello",
            TimeLimit = 0,
            NumberRange = 100,
            CreatedAt = DateTime.Now,
            CreatedByUserId = 2,
            GameRules = new List<GameRule>()
            {
                new GameRule()
                {
                    GameId = 1,
                    DivisibleNumber = 11,
                    ReplacedWord = "foo",
                    RuleId = 1
                },
                new GameRule()
                {
                    GameId = 1,
                    DivisibleNumber = 15,
                    ReplacedWord = "bar",
                    RuleId = 2
                }
            }
        };

        var gameAttempt = new GameAttempt()
        {
            AttemptId = 1,
            Score = 0,
            AttemptedDate = DateTime.UtcNow,
            AttemptByUserId = 2,
            GameId = 1,
            Game = mockGame,
        };
        var expectedQuestion = new GameQuestion()
        {
            QuestionNumber = 12,
            GameAttemptId = 1,
            GameAttempt = gameAttempt,
            IsCorrectAnswer = false,
            UserAnswer = "", Id = 1
        };
        var isCorrectAnswer = mockGame.CheckAnswer(expectedQuestion.QuestionNumber, checkPayload.Answer);

        var updatedQuestionDto = new GameQuestionDto()
        {
            Id = 1,
            GameAttemptId = 1,
            IsCorrectAnswer = isCorrectAnswer,
            UserAnswer = checkPayload.Answer
        };
        _mockGameQuestionRepository.Setup(s => s.GetGameQuestionById(checkPayload.QuestionId))
            .ReturnsAsync(expectedQuestion);

        _mockMapper.Setup(m => m.Map<GameQuestionDto>(It.IsAny<GameQuestion>())).Returns(updatedQuestionDto);

        //Act
        var res = await _gameAttemptService.CheckAnswer(checkPayload);

        //Assert
        Assert.That(res, Is.EqualTo(updatedQuestionDto));

        // Verify that UpdateGameAttempt was called with the updated attempt
        _mockGameAttemptRepository.Verify(
            s => s.UpdateGameAttempt(It.Is<GameAttempt>(g => g.AttemptId == 1 && g.Score == 1)),
            Times.Once);
        
        _mockGameQuestionRepository.Verify(
            s => s.UpdateGameQuestion(It.Is<GameQuestion>(q =>
                q.Id == expectedQuestion.Id && q.IsCorrectAnswer == isCorrectAnswer && q.UserAnswer == checkPayload.Answer)),
            Times.Once);
    }

    [Test]
    public async Task CheckAnswer_NoRuleMatch_AnswerIncorrect_KeepAttemptScoreAndReturnsUpdatedQuestion()
    {
        // Arrange
        var checkPayload = new CheckAnswerDto()
        {
            QuestionId = 1,
            Answer = "foo"
        };
        var mockGame = new Game()
        {
            GameId = 1,
            GameName = "Hello",
            TimeLimit = 0,
            NumberRange = 100,
            CreatedAt = DateTime.Now,
            CreatedByUserId = 2,
            GameRules = new List<GameRule>()
            {
                new GameRule()
                {
                    GameId = 1,
                    DivisibleNumber = 11,
                    ReplacedWord = "foo",
                    RuleId = 1
                },
                new GameRule()
                {
                    GameId = 1,
                    DivisibleNumber = 15,
                    ReplacedWord = "bar",
                    RuleId = 2
                }
            }
        };

        var gameAttempt = new GameAttempt()
        {
            AttemptId = 1,
            Score = 0,
            AttemptedDate = DateTime.UtcNow,
            AttemptByUserId = 2,
            GameId = 1,
            Game = mockGame,
        };
        var expectedQuestion = new GameQuestion()
        {
            QuestionNumber = 12,
            GameAttemptId = 1,
            GameAttempt = gameAttempt,
            IsCorrectAnswer = false,
            UserAnswer = "", Id = 1
        };
        var isCorrectAnswer = mockGame.CheckAnswer(expectedQuestion.QuestionNumber, checkPayload.Answer);

        var updatedQuestionDto = new GameQuestionDto()
        {
            Id = 1,
            GameAttemptId = 1,
            IsCorrectAnswer = isCorrectAnswer,
            UserAnswer = checkPayload.Answer
        };
        _mockGameQuestionRepository.Setup(s => s.GetGameQuestionById(checkPayload.QuestionId))
            .ReturnsAsync(expectedQuestion);
        _mockGameAttemptRepository.Setup(s => s.UpdateGameAttempt(gameAttempt))
            .ReturnsAsync(gameAttempt);
        _mockMapper.Setup(m => m.Map<GameQuestionDto>(It.IsAny<GameQuestion>())).Returns(updatedQuestionDto);

        //Act
        var res = await _gameAttemptService.CheckAnswer(checkPayload);

        //Assert
        Assert.That(res, Is.EqualTo(updatedQuestionDto));

        // Verify that UpdateGameAttempt was called with the updated attempt
        _mockGameAttemptRepository.Verify(
            s => s.UpdateGameAttempt(It.Is<GameAttempt>(g => g.AttemptId == 1 && g.Score == 0)),
            Times.Once);
    }
}