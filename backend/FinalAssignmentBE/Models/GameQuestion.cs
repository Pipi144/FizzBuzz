using System.ComponentModel.DataAnnotations;

namespace FinalAssignmentBE.Models;

public class GameQuestion
{
    [Key] public long Id { get; set; }

    public int QuestionNumber { get; set; }
    public string UserAnswer { get; set; } = string.Empty;
    public bool IsCorrectAnswer { get; set; } = false;
    public long GameAttemptId { get; set; }
    public GameAttempt GameAttempt { get; set; }

    public GameQuestion()
    {
    }

    public GameQuestion(int questionNumber, long gameAttemptId)
    {
        QuestionNumber = questionNumber;
        GameAttemptId = gameAttemptId;
    }
}