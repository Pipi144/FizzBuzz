using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FinalAssignmentBE.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameRuleController : ControllerBase
    {
        private readonly IGameRuleService _gameRuleService;
        private readonly ILogger<GameRuleController> _logger;

        public GameRuleController(IGameRuleService gameRuleService, ILogger<GameRuleController> logger)
        {
            _gameRuleService = gameRuleService;
            _logger = logger;
        }
        // // GET: api/<GameRuleController>
        // [HttpGet]
        // public IEnumerable<string> Get()
        // {
        //     return new string[] { "value1", "value2" };
        // }
        //
        // // GET api/<GameRuleController>/5
        // [HttpGet("{id}")]
        // public string Get(int id)
        // {
        //     return "value";
        // }

        // POST api/<GameRuleController>
        [HttpPost]
        public async Task<ActionResult<GameRuleDto>> AddGameRule([FromBody] AddGameRuleDto gameRule)
        {
            try
            {
                var result = await _gameRuleService.AddGameRule(gameRule);
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError("ERROR GameRuleController => AddGameRule:", e.Message);
                throw;
            }
        }

        // PUT api/<GameRuleController>/5
        [HttpPatch("{id}")]
        public async Task<ActionResult<GameRuleDto>> EditGameRule(int id, [FromBody] EditGameRuleDto payload)
        {
            try
            {
                var result = await _gameRuleService.EditGameRule(id, payload);
                return Ok(result);
            }
            catch (Exception e)
            {
                _logger.LogError("ERROR GameRuleController => EditGameRule:", e.Message);
                throw;
            }
        }

        // DELETE api/<GameRuleController>/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGameRule(int id)
        {
            try
            {
                await _gameRuleService.DeleteGameRuleById(id);
                return NoContent();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }
    }
}