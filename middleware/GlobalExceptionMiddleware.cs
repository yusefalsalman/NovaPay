using System.Net;
using System.Text.Json;

namespace NovaPay.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            // call the next middleware in the pipeline
            await _next(context);
        }
        catch (Exception ex)
        {
            // in case of any unexpected crash anywhere
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    //  This method handles the exception by setting the response status code and returning a JSON response with error details.
    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError; // 500

        var errorResponse = new
        {
            statusCode = context.Response.StatusCode,
            message = "An unexpected error occurred on the server.",
            detailed = exception.Message // Include the exception message for debugging purposes; in production, you might want to omit this or log it instead.
        };

        var json = JsonSerializer.Serialize(errorResponse);
        return context.Response.WriteAsync(json);
    }
}