using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace SBShared.Models;


public class Game
{
    [Key] public long GameId { get; set; }
    public string GameName { get; set; }
    public int TimeLimit { get; set; } = 0;

    public int NumberRange { get; set; } = 20;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public long CreatedByUserId { get; set; }


    [ForeignKey(nameof(CreatedByUserId))] public User User { get; set; }

    public List<GameRule> GameRules { get; set; } = new List<GameRule>();

    public bool CheckAnswer(int inputNumber, string answer)
    {
        if (inputNumber < 0)
        {
            throw new ArgumentException("Negative numbers are not allowed.");
        }

        var matchedWords = GameRules.Where(r => inputNumber % r.DivisibleNumber == 0)
            .Select(r => r.ReplacedWord)
            .ToList();

        if (matchedWords.Any())
        {
            Console.WriteLine($"Matched words: {string.Join(", ", matchedWords)}");
            var validAnswers = GetPermutations(matchedWords)
                .Select(p => string.Join("", p))
                .ToHashSet(StringComparer.OrdinalIgnoreCase);

            return validAnswers.Contains(answer);
        }

        return int.TryParse(answer, out int parsedAnswer) && parsedAnswer == inputNumber;
    }

    private IEnumerable<IEnumerable<T>> GetPermutations<T>(List<T> list)
    {
        if (list.Count == 1) return new List<List<T>> { list };

        return list.SelectMany((item, index) =>
            GetPermutations(list.Where((_, i) => i != index).ToList())
                .Select(permutation => new List<T> { item }.Concat(permutation)));
    }
}