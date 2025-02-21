using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Interfaces;

public interface IUserRepository
{
    public Task<User> AddUser(User user);
    public Task<User> UpdateUser(User user);
    public Task DeleteUser(long userId);
    public Task<List<User>> GetUsers(GetUsersFilterDto? filter = null);
    public Task<User?> GetUserById(long id);
}