using System.ComponentModel.DataAnnotations;

namespace FinalAssignmentBE.Models;

public class GameAttempt
{
    [Key] public long AttemptId { get; set; }

    public int Score { get; set; } = 0;

    public DateTime AttemptedDate { get; set; } = DateTime.UtcNow;

    public long AttemptByUserId { get; set; }
    public User AttemptByUser { get; set; }
    public long GameId { get; set; }
    public Game Game { get; set; }

    public List<GameQuestion> GameQuestions { get; set; } = new List<GameQuestion>();

    public GameQuestion GenerateQuestion()
    {
        int min = 0, max = Game.NumberRange;
        Random random = new Random();
        var newQuestion = new GameQuestion(random.Next(min, max + 1), AttemptId);
        return newQuestion;
    }
}