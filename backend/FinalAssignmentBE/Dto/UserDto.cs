using System.ComponentModel.DataAnnotations;
using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Dto;

public class UserDto
{
    public long UserId { get; set; }
    public string Username { get; set; }
}

public class AddUserDto
{
    [Required(ErrorMessage = "Username is required.")]
    [StringLength(50, ErrorMessage = "Username cannot exceed 50 characters.")]
    public string Username { get; set; }

    [Required(ErrorMessage = "Password is required.")]
    [StringLength(100, ErrorMessage = "Password cannot exceed 100 characters.")]
    public string Password { get; set; }
}

public class UpdateUserDto
{
    [StringLength(50, ErrorMessage = "Username cannot exceed 50 characters.")]
    public string? Username { get; set; }

    [StringLength(100, ErrorMessage = "Password cannot exceed 100 characters.")]
    public string? Password { get; set; }
}

public class GetUsersFilterDto
{
    public string? Username { get; set; }
}