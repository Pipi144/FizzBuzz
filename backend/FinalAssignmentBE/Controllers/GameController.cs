using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalAssignmentBE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        private readonly IGameService _gameService;
        private readonly ILogger<GameController> _logger;

        public GameController(IGameService gameService, ILogger<GameController> logger)
        {
            _gameService = gameService;
            _logger = logger;
        }

        // GET: api/<GameController>
        [HttpGet]
        public async Task<ActionResult<List<GameDto>>> GetGames([FromQuery] GetGamesParamsDto? getGamesParams)
        {
            try
            {
                var games = await _gameService.GetAllGames(getGamesParams);
                return Ok(games);
            }
            catch (Exception e)
            {
                _logger.LogError("Error GameController GetGames:", e.Message);
                // return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
                throw;
            }
        }

        // GET api/<GameController>/5
        [HttpGet("{id}")]
        public async Task<ActionResult<GameDto>> GetGameById(long id)
        {
            try
            {
                var game = await _gameService.GetGameById(id);
                if (game == null)
                    return NotFound($"Game with id {id} not found");
                return Ok(game);
            }
            catch (Exception e)
            {
                _logger.LogError("Error GameController GetGameById:", e.Message);
                // return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
                throw;
            }
        }

        // POST api/<GameController>
        [HttpPost]
        public async Task<IActionResult> AddGame([FromBody] AddGameDto addGameDto)
        {
            try
            {
                var newGame = await _gameService.AddGame(addGameDto);
                return CreatedAtAction(nameof(GetGameById), new { id = newGame.GameId }, newGame);
            }

            catch (Exception e)
            {
                _logger.LogError("Error GameController CreateGame:", e);
                // return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
                throw;
            }
        }

        // PUT api/<GameController>/5
        [HttpPatch("{id}")]
        public async Task<ActionResult<GameDto>> UpdateGame(int id, [FromBody] UpdateGameDto updateGameDto)
        {
            try
            {
                var updatedGame = await _gameService.UpdateGame(id, updateGameDto);
                return Ok(updatedGame);
            }
            catch (Exception e)
            {
                _logger.LogError("Error GameController GetGameById:", e.Message);
                // return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
                throw;
            }
        }

        // DELETE api/<GameController>/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGame(long id)
        {
            try
            {
                await _gameService.DeleteGame(id);
                return NoContent();
            }
            catch (Exception e)
            {
                _logger.LogError("Error GameController DeleteGame:", e.Message);
                // return StatusCode(StatusCodes.Status500InternalServerError, "An unexpected error occurred.");
                throw;
            }
        }
    }
}