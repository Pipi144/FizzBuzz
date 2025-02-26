using System.ComponentModel.DataAnnotations;
namespace SBShared.Models;

public class User
{
    [Key]
    public long UserId {get; set;}
    public string Username {get; set;}
    public string  Password {get; set;}
    public List<Game> Games {get; set;} = new List<Game>();
}