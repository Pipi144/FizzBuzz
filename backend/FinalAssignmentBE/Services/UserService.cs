using System.Security.Authentication;
using AutoMapper;
using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Interfaces;
using FinalAssignmentBE.Models;
using Microsoft.AspNetCore.Identity;

namespace FinalAssignmentBE.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher<User> _passwordHasher;

    public UserService(IUserRepository userRepository, ILogger<UserService> logger, IMapper mapper)
    {
        _userRepository = userRepository;
        _logger = logger;
        _mapper = mapper;
        _passwordHasher = new PasswordHasher<User>();
    }

    public async Task<UserDto> AddUser(AddUserDto addUserDto)
    {
        try
        {
            var foundMatchingUserName = await _userRepository.GetUsers(new GetUsersFilterDto()
            {
                Username = addUserDto.Username
            });
            if (foundMatchingUserName.Count > 0)
                throw new ArgumentException($"Username {addUserDto.Username} is already taken");
            var user = _mapper.Map<User>(addUserDto);
            // Hash the password before saving
            user.Password = _passwordHasher.HashPassword(user, addUserDto.Password);

            var result = await _userRepository.AddUser(user);

            return _mapper.Map<UserDto>(result);
        }
        catch (Exception e)
        {
            _logger.LogError("ERROR USERSERVICE => AddUser:", e);
            throw;
        }
    }


    public async Task<UserDto?> GetUserById(long id)
    {
        try
        {
            var user = await _userRepository.GetUserById(id);
            return _mapper.Map<UserDto>(user);
        }
        catch (Exception e)
        {
            _logger.LogError("ERROR USERSERVICE => GetUserById:", e);
            throw;
        }
    }

    public async Task<List<UserDto>> GetUsers(GetUsersFilterDto? filter = null)
    {
        try
        {
            var users = await _userRepository.GetUsers(filter);
            return _mapper.Map<List<UserDto>>(users);
        }
        catch (Exception e)
        {
            _logger.LogError("ERROR USERSERVICE => GetUsers:", e);
            throw;
        }
    }

    public async Task DeleteUser(long id)
    {
        try
        {
            await _userRepository.DeleteUser(id);
        }
        catch (Exception e)
        {
            _logger.LogError("ERROR USERSERVICE => DeleteUser:", e);
            throw;
        }
    }

    public async Task<UserDto> UpdateUser(long id, UpdateUserDto payload)
    {
        try
        {
            var user = await _userRepository.GetUserById(id);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            if (!string.IsNullOrEmpty(payload.Username))
                user.Username = payload.Username;
            if (!string.IsNullOrEmpty(payload.Password))
                user.Password = payload.Password;
            var updatedUser = await _userRepository.UpdateUser(user);
            return _mapper.Map<UserDto>(updatedUser);
        }
        catch (Exception e)
        {
            _logger.LogError("ERROR USERSERVICE => UpdateUser:", e);
            throw;
        }
    }

    public async Task<UserDto> Login(AddUserDto payload)
    {
        try
        {
            var matchingUserName = await _userRepository.GetUsers(new GetUsersFilterDto()
            {
                Username = payload.Username
            });
            var user = matchingUserName.FirstOrDefault();
            if (user == null) throw new KeyNotFoundException("Username not found");
            var passwordVerification = _passwordHasher.VerifyHashedPassword(user, user.Password, payload.Password);
            if (passwordVerification == PasswordVerificationResult.Failed)
                throw new AuthenticationException("Invalid username or password");
            return _mapper.Map<UserDto>(matchingUserName.First());
        }
        catch (Exception e)
        {
            _logger.LogError("ERROR USERSERVICE => Login:", e);
            throw;
        }
    }
}