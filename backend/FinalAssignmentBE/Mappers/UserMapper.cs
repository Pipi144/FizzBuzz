using AutoMapper;
using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Mappers;

public class UserMapper:Profile
{
    public UserMapper()
    {
        CreateMap<AddUserDto, User>();
        CreateMap<User, UserDto>();
        
    }
}