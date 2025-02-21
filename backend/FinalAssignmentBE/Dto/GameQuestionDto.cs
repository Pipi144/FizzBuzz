namespace FinalAssignmentBE.Dto;

public class GameQuestionDto
{
    public long Id { get; set; }

    public int QuestionNumber { get; set; }
    public string UserAnswer { get; set; } = string.Empty;
    public bool IsCorrectAnswer { get; set; } = false;
    public long GameAttemptId { get; set; }
}