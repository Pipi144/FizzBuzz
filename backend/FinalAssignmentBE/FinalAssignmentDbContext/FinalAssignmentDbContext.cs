using FinalAssignmentBE.Models;
using Microsoft.EntityFrameworkCore;

public class FinalAssignmentDbContext : DbContext
{
    public FinalAssignmentDbContext(DbContextOptions<FinalAssignmentDbContext> options) : base(options) { }
    
    
    public DbSet<User> Users { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<GameRule> GameRules { get; set; }
    public DbSet<GameAttempt> GameAttempts { get; set; }
    
    public DbSet<GameQuestion> GameQuestions { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Game>()
            .HasOne(g => g.User)
            .WithMany(u => u.Games)
            .HasForeignKey(g => g.CreatedByUserId);
    }
}