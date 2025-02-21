using FinalAssignmentBE.Models;
using FinalAssignmentBE.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace FinalAssignmentBETest;

[TestFixture]
public class UserRepositoryTest
{
    private UserRepository _userRepository;
    private DbContextOptions<FinalAssignmentDbContext> _dbContextOptions;
    private FinalAssignmentDbContext _dbContext;
    private Mock<ILogger<UserRepository>> _mockLogger;

    [SetUp]
    public void Setup()
    {
        _dbContextOptions = new DbContextOptionsBuilder<FinalAssignmentDbContext>()
            .UseInMemoryDatabase("TestDatabase")
            .Options;
        _mockLogger = new Mock<ILogger<UserRepository>>();
        _dbContext = new FinalAssignmentDbContext(_dbContextOptions);
        _userRepository = new UserRepository(_dbContext, _mockLogger.Object);

        // Seed data
        _dbContext.Users.AddRange(new List<User>
        {
            new User() { UserId = 1, Username = "Pipi", Password = "pipi" },
            new User() { UserId = 2, Username = "Pipi1", Password = "pipi1" },
            new User() { UserId = 3, Username = "Pipi2", Password = "pipi2" }
        });
        _dbContext.SaveChanges();
    }

    [TearDown]
    public void TearDown()
    {
        _dbContext.Database.EnsureDeleted();
        _dbContext.Dispose();
    }

    [Test]
    public async Task GetUsers_ReturnsAllUsers()
    {
        // Act
        var result = await _userRepository.GetUsers();

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(3));
    }

    [Test]
    public async Task GetUserById_ReturnMatchingUser()
    {
        // Arrange
        long userId = 1;

        // Act
        var result = await _userRepository.GetUserById(userId);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.UserId, Is.EqualTo(userId));
        Assert.That(result.Username, Is.EqualTo("Pipi"));
        Assert.That(result.Password, Is.EqualTo("pipi"));
    }

    [Test]
    public void GetUserById_UserNotFound_ThrowsKeyNotFoundException()
    {
        //Arrange
        long userId = 1000;

        // Act and Arrange
        Assert.That(async () => await _userRepository.GetUserById(userId), Throws.TypeOf<KeyNotFoundException>());
    }

    [Test]
    public void GetUserById_NegativeUserId_ThrowsArgumentException()
    {
        // Arrange
        var userId = -1;

        // Act && Assert
        Assert.That(async () => await _userRepository.GetUserById(userId),
            Throws.TypeOf<ArgumentException>().And.Message.EqualTo("User Id cannot be negative"));
    }

    [Test]
    public void DeleteUserById_UserNotFound_ThrowsKeyNotFoundException()
    {
        //Arrange
        long userId = 1000;

        //Act and Assert
        Assert.That(async () => await _userRepository.DeleteUser(userId), Throws.TypeOf<KeyNotFoundException>());
    }

    [Test]
    public async Task DeleteUserById_RemoveSuccessfully()
    {
        // Arrange
        long userId = 1;

        // Act
        await _userRepository.DeleteUser(userId);

        //Assert
        Assert.That(_dbContext.Users.Any(u => u.UserId == userId), Is.False);
        Assert.That(_dbContext.Users.Count(), Is.EqualTo(2));
    }

    [Test]
    public async Task UpdateUser_UpdatesUserSuccessfully()
    {
        // Arrange
        var userToUpdate = await _dbContext.Users.FirstAsync(u => u.UserId == 1);
        var updatedUserName = "UpdatedPipi";
        userToUpdate.Username = updatedUserName;

        // Act
        var updatedUser = await _userRepository.UpdateUser(userToUpdate);

        // Assert
        Assert.That(updatedUser.Username, Is.EqualTo(updatedUserName));
        Assert.That((await _dbContext.Users.FirstAsync(u => u.UserId == 1)).Username, Is.EqualTo(updatedUserName));
    }

    [Test]
    public async Task AddUser_AddsUserSuccessfully()
    {
        // Arrange
        var newUser = new User { UserId = 10, Username = "NewUser", Password = "testPassword" };

        // Act
        var addedUser = await _userRepository.AddUser(newUser);

        // Assert
        Assert.That(addedUser, Is.Not.Null);
        Assert.That(addedUser.Username, Is.EqualTo("NewUser"));
        Assert.That(addedUser.UserId, Is.EqualTo(10));
        Assert.That(_dbContext.Users.Count(), Is.EqualTo(4));
    }
}