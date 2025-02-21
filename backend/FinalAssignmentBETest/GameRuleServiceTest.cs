using AutoMapper;
using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Interfaces;
using FinalAssignmentBE.Models;
using FinalAssignmentBE.Services;
using Microsoft.Extensions.Logging;
using Moq;

namespace FinalAssignmentBETest;

[TestFixture]
public class GameRuleServiceTest
{
    private GameRuleService _gameRuleService;
    private Mock<IGameRuleRepository> _mockGameRuleRepository;
    private Mock<ILogger<GameRuleService>> _mockLogger;
    private Mock<IMapper> _mockMapper;

    [SetUp]
    public void Setup()
    {
        _mockGameRuleRepository = new Mock<IGameRuleRepository>();
        _mockLogger = new Mock<ILogger<GameRuleService>>();
        _mockMapper = new Mock<IMapper>();
        _gameRuleService = new GameRuleService(_mockGameRuleRepository.Object, _mockLogger.Object, _mockMapper.Object);
    }

    [Test]
    public async Task AddGameRule_Success_ReturnsAddedGameRule()
    {
        // Arrange
        var newGameRuleDto = new AddGameRuleDto()
        {
            DivisibleNumber = 4,
            ReplacedWord = "Peterfour",
            GameId = 1
        };

        var expectedNewGameRule = new GameRule()
        {
            RuleId = 4,
            DivisibleNumber = newGameRuleDto.DivisibleNumber,
            ReplacedWord = newGameRuleDto.ReplacedWord,
            GameId = newGameRuleDto.GameId
        };

        var expectedNewGameDto = new GameRuleDto()
        {
            RuleId = 4,
            DivisibleNumber = newGameRuleDto.DivisibleNumber,
            ReplacedWord = newGameRuleDto.ReplacedWord,
            GameId = newGameRuleDto.GameId
        };

        _mockGameRuleRepository.Setup(s => s.AddGameRule(It.IsAny<GameRule>())).ReturnsAsync(expectedNewGameRule);
        _mockMapper.Setup(m => m.Map<GameRuleDto>(It.IsAny<GameRule>())).Returns(expectedNewGameDto);

        // Act
        var result = await _gameRuleService.AddGameRule(newGameRuleDto);

        // Assert
        Assert.That(result.DivisibleNumber, Is.EqualTo(expectedNewGameDto.DivisibleNumber));
        Assert.That(result.RuleId, Is.EqualTo(expectedNewGameDto.RuleId));
        Assert.That(result.ReplacedWord, Is.EqualTo(expectedNewGameDto.ReplacedWord));
        Assert.That(result.GameId, Is.EqualTo(expectedNewGameDto.GameId));
    }


    [Test]
    public void EditGameRule_NotFoundGameRule_ThrowsNotFoundException()
    {
        //Arrange
        var updatedGameRuleId = 99;
        _mockGameRuleRepository.Setup(s => s.GetGameRuleById(updatedGameRuleId))
            .ThrowsAsync(new KeyNotFoundException($"Game rule id {updatedGameRuleId} not found"));

        //Act & Assert
        Assert.That(async () => await _gameRuleService.EditGameRule(updatedGameRuleId, new EditGameRuleDto() { }),
            Throws.TypeOf<KeyNotFoundException>().And.Message.EqualTo($"Game rule id {updatedGameRuleId} not found"));
        _mockGameRuleRepository.Verify(s => s.UpdateGameRule(It.IsAny<GameRule>()), Times.Never);
        _mockGameRuleRepository.Verify(s => s.GetGameRuleById(updatedGameRuleId), Times.Once);
    }

    [Test]
    public async Task EditGameRule_Success_ReturnsUpdatedGameRule()
    {
        //Arrange
        var updatedGameRuleId = 1;
        var updatePayload = new EditGameRuleDto()
        {
            DivisibleNumber = 10,
            ReplacedWord = "Peter test updated"
        };
        var updatedGameRule = new GameRule()
        {
            RuleId = updatedGameRuleId,
            DivisibleNumber = 4,
            ReplacedWord = "Peterfour",
 
        };
        var updatedGameRuleDto = new GameRuleDto()
        {
            RuleId = updatedGameRuleId,
            DivisibleNumber = 10,
            ReplacedWord = "Peter test updated",
   
        };

        _mockGameRuleRepository.Setup(s => s.GetGameRuleById(1)).ReturnsAsync(updatedGameRule);
        _mockMapper.Setup(m => m.Map<GameRuleDto>(It.IsAny<GameRule>())).Returns(updatedGameRuleDto);

        //Act
        var result = await _gameRuleService.EditGameRule(updatedGameRuleId, updatePayload);

        //Assert
        Assert.That(result.RuleId, Is.EqualTo(updatedGameRuleId));
        Assert.That(result.DivisibleNumber, Is.EqualTo(updatedGameRuleDto.DivisibleNumber));
        Assert.That(result.ReplacedWord, Is.EqualTo(updatedGameRuleDto.ReplacedWord));
    }

    [Test]
    public void DeleteGameRuleById_NotFoundGameRule_ThrowsNotFoundException()
    {
        //Arrange
        var deletedGameRuleId = 99;
        _mockGameRuleRepository.Setup(s => s.DeleteGameRuleById(deletedGameRuleId))
            .ThrowsAsync(new KeyNotFoundException($"Game rule id {deletedGameRuleId} not found."));

        //Act & Assert
        Assert.That(async () => await _gameRuleService.DeleteGameRuleById(deletedGameRuleId),
            Throws.TypeOf<KeyNotFoundException>().And.Message.EqualTo($"Game rule id {deletedGameRuleId} not found."));
        _mockGameRuleRepository.Verify(s => s.DeleteGameRuleById(deletedGameRuleId), Times.Once);
    }


    [Test]
    public async Task DeleteGameRule_Success_GameRuleDeleted()
    {
        // Arrange
        var validId = 1;
        _mockGameRuleRepository.Setup(repo => repo.DeleteGameRuleById(validId))
            .Returns(Task.CompletedTask);

        // Act
        await _gameRuleService.DeleteGameRuleById(validId);

        // Assert
        _mockGameRuleRepository.Verify(repo => repo.DeleteGameRuleById(validId), Times.Once);
    }
}