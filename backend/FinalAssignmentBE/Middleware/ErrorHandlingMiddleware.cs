using FinalAssignmentBE.Models;

namespace FinalAssignmentBE.Middleware;

public class ErrorHandlingMiddleware
{
    public delegate Task ErrorHandlerDelegate(HttpContext context, Exception exception);

    public event ErrorHandlerDelegate? OnError;

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            // Proceed to the next middleware in the pipeline
            await next(context);
        }
        catch (Exception ex)
        {

            if (OnError != null)
            {
                // Notify all subscribers about the error
                await OnError.Invoke(context, ex);
            }
            else
            {
                // Default behavior if no subscribers are attached
                await HandleExceptionAsync(context, ex);
            }
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = exception switch
        {
            KeyNotFoundException => new ErrorResponse
            {
                StatusCode = StatusCodes.Status404NotFound,
                Message = exception.Message,
                Type = "Not Found"
            },
            UnauthorizedAccessException => new ErrorResponse
            {
                StatusCode = StatusCodes.Status401Unauthorized,
                Message = "You are not authorized to perform this action.",
                Type = "Unauthorized"
            },
            ArgumentException => new ErrorResponse
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = exception.Message,
                Type = "Bad Request"
            },
            _ => new ErrorResponse
            {
                StatusCode = StatusCodes.Status500InternalServerError,
                Message = "An unexpected error occurred.",
                Detailed = exception.Message,
                Type = "Internal Server Error"
            }
        };

        context.Response.StatusCode = response.StatusCode;
        return context.Response.WriteAsJsonAsync(response);
    }

};