namespace SBShared.Models;

public class ErrorResponse
{
    public int StatusCode { get; set; }
    public string Message { get; set; }
    public string? Detailed { get; set; } // Optional for some responses
    public string Type { get; set; }
}