using System.ComponentModel.DataAnnotations;
namespace SBShared.Models;

public class GameRule
{
    [Key]
    public long RuleId { get; set; }
    public int DivisibleNumber { get; set; }
    public string ReplacedWord { get; set; }
    public long GameId { get; set; }
    public Game Game { get; set; }
}