using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalAssignmentBE.Controllers
{
    [Route("api/game-attempt")]
    [ApiController]
    public class GameAttemptController : ControllerBase
    {
        private readonly IGameAttemptService _gameAttemptService;
        private readonly ILogger<GameAttemptController> _logger;

        public GameAttemptController(IGameAttemptService gameAttemptService, ILogger<GameAttemptController> logger)
        {
            _gameAttemptService = gameAttemptService;
            _logger = logger;
        }

        // GET api/game-attempt/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<GameAttemptDto>> GetGameAttemptById(long id)
        {
            try
            {
                var res = await _gameAttemptService.GetGameAttemptById(id);
                return Ok(res);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogError("ERROR GameAttemptController => GetGameAttemptById: {Message}", ex.Message);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError("ERROR GameAttemptController => GetGameAttemptById: {Message}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error");
            }
        }

        // POST api/game-attempt
        [HttpPost]
        public async Task<IActionResult> CreateGameAttempt([FromBody] AddGameAttemptDto payload)
        {
            try
            {
                var res = await _gameAttemptService.CreateGameAttempt(payload);
                return CreatedAtAction(nameof(GetGameAttemptById), new { id = res.AttemptId }, res);
            }
            catch (Exception ex)
            {
                _logger.LogError("ERROR GameAttemptController => CreateGameAttempt: {Message}", ex.Message);
                return BadRequest(ex.Message);
            }
        }

        // GET api/game-attempt/generate-question/{id}
        [HttpGet("generate-question/{id}")]
        public async Task<ActionResult<GameQuestionDto>> GenerateQuestion([FromRoute] long id)
        {
            try
            {
                _logger.LogInformation("GenerateQuestion called with GameAttemptId: {GameAttemptId}", id);
                var res = await _gameAttemptService.GenerateQuestion(id);
                return Ok(res);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogError("ERROR GameAttemptController => GenerateQuestion: {Message}", ex.Message);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError("ERROR GameAttemptController => GenerateQuestion: {Message}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error");
            }
        }

        // POST api/game-attempt/check
        [HttpPost("check")]
        public async Task<ActionResult<GameQuestionDto>> CheckAnswer([FromBody] CheckAnswerDto payload)
        {
            try
            {
                var res = await _gameAttemptService.CheckAnswer(payload);
                var newQuestion = await _gameAttemptService.GenerateQuestion(res.GameAttemptId);
                return Ok(newQuestion);
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogError("ERROR GameAttemptController => CheckAnswer: {Message}", ex.Message);
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError("ERROR GameAttemptController => CheckAnswer: {Message}", ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal Server Error");
            }
        }
    }
}