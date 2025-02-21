using FinalAssignmentBE.Dto;

namespace FinalAssignmentBE.Interfaces;

public interface IUserService
{
    public Task<UserDto> AddUser(AddUserDto addUserDto);
    public Task<UserDto?> GetUserById(long id);
    public Task<List<UserDto>> GetUsers(GetUsersFilterDto? filter = null);

    public Task DeleteUser(long id);
    public Task<UserDto> UpdateUser(long id, UpdateUserDto payload);
    public Task<UserDto> Login(AddUserDto payload);
}