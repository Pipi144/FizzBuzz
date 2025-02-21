using FinalAssignmentBE.Interfaces;
using FinalAssignmentBE.Middleware;
using FinalAssignmentBE.Repositories;
using FinalAssignmentBE.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

// Configure Kestrel for Docker
builder.WebHost.ConfigureKestrel(options => options.ListenAnyIP(4444));

// Environment Variables for CORS
var allowedOrigin = builder.Configuration["FrontendUrl"] ?? "http://localhost:3000";
builder.Services.AddCors(options =>
{
    options.AddPolicy(MyAllowSpecificOrigins, policy =>
        policy.WithOrigins(allowedOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});
// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//Register automapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// Database Configuration
builder.Services.AddDbContext<FinalAssignmentDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                           ?? throw new InvalidOperationException(
                               "Connection string 'DefaultConnection' is not defined.");
    options.UseNpgsql(connectionString, npgsqlOptions => npgsqlOptions.EnableRetryOnFailure());
});


// DI
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IGameRepository, GameRepository>();
builder.Services.AddScoped<IGameService, GameService>();
builder.Services.AddScoped<IGameAttemptRepository, GameAttemptRepository>();
builder.Services.AddScoped<IGameAttemptService, GameAttemptService>();
builder.Services.AddScoped<IGameRuleRepository, GameRuleRepository>();
builder.Services.AddScoped<IGameRuleService, GameRuleService>();
builder.Services.AddScoped<IGameQuestionRepository, GameQuestionRepository>();

builder.Services.AddHttpClient();

var app = builder.Build();

// ✅ Automatically apply migrations on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<FinalAssignmentDbContext>();
    dbContext.Database.Migrate();  // Applies any pending migrations
}

app.UseRouting();
app.UseCors(MyAllowSpecificOrigins);

// Configure middleware
var errorHandlingMiddleware = new ErrorHandlingMiddleware();

// Use the middleware
app.Use(async (context, next) => await errorHandlingMiddleware.InvokeAsync(context, next));

// Swagger

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Your API v1"));

app.MapControllers();
app.Run();