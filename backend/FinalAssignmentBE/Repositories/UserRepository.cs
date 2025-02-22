using FinalAssignmentBE.Dto;
using FinalAssignmentBE.Interfaces;
using FinalAssignmentBE.Models;
using Microsoft.EntityFrameworkCore;

namespace FinalAssignmentBE.Repositories;

public class UserRepository : IUserRepository
{
    private readonly FinalAssignmentDbContext _context;
    private readonly ILogger<UserRepository> _logger;

    public UserRepository(FinalAssignmentDbContext context, ILogger<UserRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<User> AddUser(User user)
    {
        try
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }
        catch (Exception e)
        {
            _logger.LogError("Error AddUser Repository: ", e, e.Message);
            throw;
        }
    }

    public async Task<User> UpdateUser(User user)
    {
        try
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
            return user;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            throw;
        }
    }

    public async Task DeleteUser(long userId)
    {
        try
        {
            var deletedUser = await _context.Users.FirstOrDefaultAsync(user => user.UserId == userId);
            if (deletedUser == null)
                throw new KeyNotFoundException("User does not exist");
            _context.Users.Remove(deletedUser);
            await _context.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _logger.LogError("Error DeleteUser Repository: ", e, e.Message);

            throw;
        }
    }

    public async Task<List<User>> GetUsers(GetUsersFilterDto? filter = null)
    {
        try
        {
            var query = _context.Users.AsQueryable().AsNoTracking();

            if (filter != null)
            {
                if (!String.IsNullOrEmpty(filter.Username))
                    query = query.Where(u => u.Username == filter.Username);
            }

            // Apply default ordering by CreatedAt descending
            query = query.OrderBy(g => g.Username);

            // For read-only operations, disable change tracking
            return await query.AsNoTracking().ToListAsync();
        }
        catch (Exception e)
        {
            _logger.LogError("Error UserRepository: ", e, e.Message);
            throw;
        }
    }

    public async Task<User?> GetUserById(long id)
    {
        try
        {
            if (id < 0)
                throw new ArgumentException("User Id cannot be negative");
            var user = await _context.Users.SingleOrDefaultAsync(u => u.UserId == id);

            if (user == null)
                throw new KeyNotFoundException("User does not exist");
            return user;
        }
        catch (Exception e)
        {
            _logger.LogError("Error UserRepository GetUserById: ", e, e.Message);
            throw;
        }
    }
}