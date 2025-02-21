namespace FinalAssignmentBE.Dto;

// Basic Game DTO for lightweight responses
public class BasicGameDto
{
    public long GameId { get; set; }
    public required string GameName { get; set; }
    public int? TimeLimit { get; set; }

    public int NumberRange { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public long CreatedByUserId { get; set; }
}

// Detailed Game DTO including User and GameRules
public class GameDto : BasicGameDto
{
    public UserDto User { get; set; }
    public List<GameRuleDto> GameRules { get; set; } = new List<GameRuleDto>();
}

// DTO for querying games with optional filters
public class GetGamesParamsDto
{
    public long? CreatedByUserId { get; set; }
    public string? GameName { get; set; }
}

// DTO for adding a new game
public class AddGameDto
{
    public string GameName { get; set; }
    public int TimeLimit { get; set; }
    public long CreatedByUserId { get; set; }

    public int NumberRange { get; set; } = 20;
    public List<BasicGameRuleDto> GameRules { get; set; } = new List<BasicGameRuleDto>();
}

public class UpdateGameDto
{
    public string? GameName { get; set; }
    public int? TimeLimit { get; set; }
    public int? NumberRange { get; set; }
}