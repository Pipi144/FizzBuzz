using AutoMapper;
using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Interfaces;
using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Services;

public class GameRuleService : IGameRuleService
{
    private readonly IGameRuleRepository _gameRuleRepository;
    private readonly ILogger<GameRuleService> _logger;
    private IMapper _mapper;

    public GameRuleService(IGameRuleRepository gameRuleRepository, ILogger<GameRuleService> logger, IMapper mapper)
    {
        _gameRuleRepository = gameRuleRepository;
        _logger = logger;
        _mapper = mapper;
    }

    public async Task<GameRuleDto> AddGameRule(AddGameRuleDto gameRule)
    {
        try
        {
            var addedGameRule = _mapper.Map<GameRule>(gameRule);
            var result = await _gameRuleRepository.AddGameRule(addedGameRule);
            return _mapper.Map<GameRuleDto>(result);
        }
        catch (Exception e)
        {
            _logger.LogError("Error GameRuleService=> AddGameRule:", e.Message);
            throw;
        }
    }

    public async Task<GameRuleDto> EditGameRule(long updatedId, EditGameRuleDto editPayloadDto)
    {
        try
        {
            var updatedGameRule = await _gameRuleRepository.GetGameRuleById(updatedId);
            if (updatedGameRule == null)
                throw new KeyNotFoundException($"Game rule with id {updatedId} not found");
            if (editPayloadDto.DivisibleNumber != null)
                updatedGameRule.DivisibleNumber = (int)editPayloadDto.DivisibleNumber;
            if (editPayloadDto.ReplacedWord != null)
                updatedGameRule.ReplacedWord = editPayloadDto.ReplacedWord;
            var result = await _gameRuleRepository.UpdateGameRule(updatedGameRule);
            return _mapper.Map<GameRuleDto>(result);
        }
        catch (Exception e)
        {
            _logger.LogError("Error GameRuleService=> EditGameRule:", e.Message);
            throw;
        }
    }

    public async Task DeleteGameRuleById(long id)
    {
        try
        {
            await _gameRuleRepository.DeleteGameRuleById(id);
        }
        catch (Exception e)
        {
            _logger.LogError("Error GameRuleService=> DeleteGameRuleById:", e.Message);
            throw;
        }
    }
}