using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Dto;

public class GameAttemptDto
{
    public long AttemptId { get; set; }

    public int Score { get; set; } = 0;
    public long GameId { get; set; }
    public DateTime AttemptedDate { get; set; } = DateTime.UtcNow;
    public long AttemptByUserId { get; set; }
    public UserDto AttemptByUser { get; set; }
    
    public List<GameQuestionDto> GameQuestions { get; set; } = new List<GameQuestionDto>(); 
}


public class AddGameAttemptDto
{
    public long GameId { get; set; }
    public long AttemptByUserId { get; set; }
}

public class CheckAnswerDto
{
    public long QuestionId { get; set; }
    public string Answer { get; set; }
}
