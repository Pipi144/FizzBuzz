using System.Security.Authentication;
using AutoMapper;
using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Interfaces;
using FinalAssignmentBE.Models;
using FinalAssignmentBE.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Moq;

namespace FinalAssignmentBETest;

[TestFixture]
public class UserServiceTest
{
    private UserService _userService;
    private Mock<IUserRepository> _userRepositoryMock;
    private Mock<ILogger<UserService>> _loggerMock;
    private Mock<IMapper> _mapperMock;

    [SetUp]
    public void Setup()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _loggerMock = new Mock<ILogger<UserService>>();
        _mapperMock = new Mock<IMapper>();
        _userService = new UserService(_userRepositoryMock.Object, _loggerMock.Object, _mapperMock.Object);
        var passwordHasherMock = new Mock<IPasswordHasher<User>>();
        // Mock password hasher behavior
        passwordHasherMock
            .Setup(h => h.HashPassword(It.IsAny<User>(), It.IsAny<string>()))
            .Returns((User u, string password) => new PasswordHasher<User>().HashPassword(u, password));

        passwordHasherMock
            .Setup(h => h.VerifyHashedPassword(It.IsAny<User>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns((User u, string hashedPassword, string providedPassword) =>
            {
                var hasher = new PasswordHasher<User>();
                return hasher.VerifyHashedPassword(u, hashedPassword, providedPassword);
            });
    }

    [Test]
    public void AddUser_UserNameExists_ThrowsArgumentException()
    {
        //Arrange
        var existingUser = new User()
        {
            Username = "Pipi",
            Password = "1234",
            UserId = 1,
        };
        var addPayload = new AddUserDto()
        {
            Username = "Pipi",
            Password = "1234",
        };
        _userRepositoryMock.Setup(s => s.GetUsers(It.Is<GetUsersFilterDto>(f => f.Username == existingUser.Username)))
            .ReturnsAsync(new List<User>()
            {
                existingUser
            });

        // Act & Assert
        Assert.That(async () => await _userService.AddUser(addPayload),
            Throws.TypeOf<ArgumentException>().And.Message.EqualTo($"Username {addPayload.Username} is already taken"));
    }


    [Test]
    public async Task AddUserAsync_ValidUser_Success()
    {
        // Arrange
        var addUserDto = new AddUserDto
        {
            Username = "Pipi1234",
            Password = "pipi"
        };
        var passwordHasherMock = new PasswordHasher<User>();
        var hashedPassword = passwordHasherMock.HashPassword(null, addUserDto.Password);
        var mockUser = new User
        {
            Username = addUserDto.Username,
            Password = hashedPassword,
            UserId = 4
        };

        var expectedUserDto = new UserDto
        {
            UserId = mockUser.UserId,
            Username = mockUser.Username
        };
        _userRepositoryMock.Setup(repo => repo.GetUsers(It.Is<GetUsersFilterDto>(u =>
                u.Username == addUserDto.Username)))
            .ReturnsAsync(new List<User>());
        _userRepositoryMock.Setup(repo => repo.AddUser(It.Is<User>(u =>
                u.Username == addUserDto.Username &&
                passwordHasherMock.VerifyHashedPassword(null, hashedPassword, addUserDto.Password) ==
                PasswordVerificationResult.Success)))
            .ReturnsAsync(mockUser);
        _mapperMock.Setup(mapper => mapper.Map<User>(addUserDto)).Returns(mockUser);
        _mapperMock.Setup(mapper => mapper.Map<UserDto>(mockUser)).Returns(expectedUserDto);

        // Act
        var result = await _userService.AddUser(addUserDto);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Username, Is.EqualTo(expectedUserDto.Username));
        Assert.That(result.UserId, Is.EqualTo(expectedUserDto.UserId));

        // Verify repository and mapper calls
        _userRepositoryMock.Verify(repo => repo.AddUser(It.IsAny<User>()), Times.Once);
        _mapperMock.Verify(mapper => mapper.Map<User>(addUserDto), Times.Once);
        _mapperMock.Verify(mapper => mapper.Map<UserDto>(mockUser), Times.Once);
    }

    [Test]
    public async Task GetUserById_Success_ReturnsMatchingUser()
    {
        //Arrange
        var userId = 1;

        var mockUser = new User
        {
            Username = "Pipi",
            Password = "1234",
            UserId = 1
        };

        var expectedUserDto = new UserDto
        {
            UserId = mockUser.UserId,
            Username = mockUser.Username
        };
        _userRepositoryMock.Setup(s => s.GetUserById(userId)).ReturnsAsync(mockUser);
        _mapperMock.Setup(s => s.Map<UserDto>(mockUser)).Returns(expectedUserDto);

        //Act
        var result = await _userService.GetUserById(userId);

        //Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Username, Is.EqualTo(expectedUserDto.Username));
        Assert.That(result.UserId, Is.EqualTo(expectedUserDto.UserId));
    }

    [Test]
    public void GetUserById_NotExistingUser_ThrowNotFoundException()
    {
        // Arrange
        var userId = 999;
        _userRepositoryMock.Setup(s => s.GetUserById(userId))
            .ThrowsAsync(new KeyNotFoundException("User does not exist"));
        // Act and Assert
        var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () => await _userService.GetUserById(userId));

        Assert.That(exception.Message, Is.EqualTo("User does not exist"));
    }

    [Test]
    public async Task GetUsers_Success_ReturnsAllUsers()
    {
        //Arrange
        var users = new List<User>()
        {
            new User()
            {
                Username = "Pipi",
                Password = "1234",
                UserId = 1
            },
            new User()
            {
                Username = "Pipi",
                Password = "1234",
                UserId = 2
            }
        };
        var expectedUsers = new List<UserDto>()
        {
            new UserDto()
            {
                UserId = 1,
                Username = "Pipi",
            },
            new UserDto()
            {
                UserId = 2,
                Username = "Pipi",
            }
        };
        _userRepositoryMock.Setup(s => s.GetUsers(null)).ReturnsAsync(users);
        _mapperMock.Setup(s => s.Map<List<UserDto>>(users)).Returns(expectedUsers);

        //Act
        var result = await _userService.GetUsers();

        //Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(users.Count));
        Assert.That(result[0].Username, Is.EqualTo(expectedUsers[0].Username));
        Assert.That(result[0].UserId, Is.EqualTo(expectedUsers[0].UserId));
        Assert.That(result[1].Username, Is.EqualTo(expectedUsers[1].Username));
        Assert.That(result[1].UserId, Is.EqualTo(expectedUsers[1].UserId));
    }

    [Test]
    public async Task DeleteUserById_Success_RemovesUser()
    {
        //Arrange
        var userId = 1;

        _userRepositoryMock.Setup(s => s.DeleteUser(userId)).Returns(Task.CompletedTask);

        // Act
        await _userService.DeleteUser(userId);

        //Assert
        _userRepositoryMock.Verify(repo => repo.DeleteUser(userId), Times.Once);
    }

    [Test]
    public void DeleteUserById_NotExistingUser_ThrowNotFoundException()
    {
        //Assert
        var userId = 999;
        _userRepositoryMock.Setup(s => s.DeleteUser(userId))
            .ThrowsAsync(new KeyNotFoundException("User does not exist"));

        //Act
        var exception = Assert.ThrowsAsync<KeyNotFoundException>(async () => await _userService.DeleteUser(userId));

        //Assert
        Assert.That(exception.Message, Is.EqualTo("User does not exist"));
        _userRepositoryMock.Verify(repo => repo.DeleteUser(userId), Times.Once);
    }

    [Test]
    public async Task UpdateUser_Success_ReturnsUpdatedUser()
    {
        // Arrange
        var userId = 1;
        var payload = new UpdateUserDto()
        {
            Username = "UpdatedPipi",
            Password = "Updatedpassword",
        };
        var mockUser = new User()
        {
            Username = "Pipi",
            Password = "1234",
            UserId = userId
        };
        var expectedUserDto = new UserDto()
        {
            UserId = mockUser.UserId,
            Username = mockUser.Username,
        };
        _userRepositoryMock.Setup(s => s.GetUserById(userId)).ReturnsAsync(mockUser);
        _userRepositoryMock
            .Setup(s => s.UpdateUser(
                It.Is<User>(u => u.Username == mockUser.Username && u.Password == mockUser.Password)))
            .ReturnsAsync(mockUser);
        _mapperMock.Setup(s => s.Map<UserDto>(mockUser)).Returns(expectedUserDto);

        //Act
        var result = await _userService.UpdateUser(userId, payload);

        //Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Username, Is.EqualTo(expectedUserDto.Username));
        Assert.That(result.UserId, Is.EqualTo(expectedUserDto.UserId));
        _userRepositoryMock.Verify(repo => repo.UpdateUser(It.IsAny<User>()), Times.Once);
        _userRepositoryMock.Verify(repo => repo.GetUserById(userId), Times.Once);
    }


    [Test]
    public void UpdateUser_NotExistingUser_ThrowNotFoundException()
    {
        //Arrange
        var userId = 999;
        var payload = new UpdateUserDto()
        {
            Username = "UpdatedPipi",
        };
        _userRepositoryMock.Setup(s => s.GetUserById(userId))
            .ThrowsAsync(new KeyNotFoundException("User does not exist"));

        //Act
        var exception =
            Assert.ThrowsAsync<KeyNotFoundException>(async () => await _userService.UpdateUser(userId, payload));

        //Assert
        Assert.That(exception.Message, Is.EqualTo("User does not exist"));
    }


    [Test]
    public void Login_UserNameNotFound_ThrowsNotFoundException()
    {
        //Arrange
        var existingUser = new User()
        {
            Username = "Pipi",
            Password = "1234",
            UserId = 1,
        };
        var addPayload = new AddUserDto()
        {
            Username = "Pipi",
            Password = "1234",
        };
        _userRepositoryMock.Setup(s => s.GetUsers(It.Is<GetUsersFilterDto>(f => f.Username == existingUser.Username)))
            .ReturnsAsync(new List<User>());


        // Act & Assert
        Assert.That(async () => await _userService.Login(addPayload),
            Throws.TypeOf<KeyNotFoundException>().And.Message.EqualTo("Username not found"));
    }

    [Test]
    public void Login_UserFound_NotMatchingPassword_ThrowsAuthenticationException()
    {
        //Arrange
        var existingUser = new User()
        {
            Username = "Pipi",
            Password = "1234",
            UserId = 1,
        };
        var addPayload = new AddUserDto()
        {
            Username = "Pipi",
            Password = "3456",
        };
        _userRepositoryMock.Setup(s => s.GetUsers(It.Is<GetUsersFilterDto>(f => f.Username == existingUser.Username)))
            .ReturnsAsync(new List<User>() { existingUser });


        // Act & Assert
        Assert.That(async () => await _userService.Login(addPayload),
            Throws.TypeOf<AuthenticationException>().And.Message.EqualTo("Invalid username or password"));
    }

    [Test]
    public async Task Login_UserFound_MatchingCredentials_ReturnsMatchingUser()
    {
        //Arrange
        var passwordHasher = new PasswordHasher<User>();
        var existingUser = new User()
        {
            Username = "Pipi",
            Password = passwordHasher.HashPassword(null, "1234"),
            UserId = 1,
        };
        var existingUserDto = new UserDto()
        {
            UserId = existingUser.UserId,
            Username = "Pipi",
        };
        var loginPayload = new AddUserDto()
        {
            Username = "Pipi",
            Password = "1234",
        };
        _userRepositoryMock.Setup(s => s.GetUsers(It.Is<GetUsersFilterDto>(f => f.Username == existingUser.Username)))
            .ReturnsAsync(new List<User>() { existingUser });
        _mapperMock.Setup((m => m.Map<UserDto>(It.Is<User>(u =>
            passwordHasher.VerifyHashedPassword(existingUser, existingUser.Password, loginPayload.Password) ==
            PasswordVerificationResult.Success && u.Username == existingUser.Username &&
            u.UserId == existingUser.UserId)))).Returns(existingUserDto);

        // Act
        var res = await _userService.Login(loginPayload);

        //Assert
        Assert.That(res, Is.Not.Null);
        Assert.That(res.Username, Is.EqualTo(existingUser.Username));
        Assert.That(res.UserId, Is.EqualTo(existingUser.UserId));
    }
}