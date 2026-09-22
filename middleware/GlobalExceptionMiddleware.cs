using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace NovaPay.Middlewares;

public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionMiddleware(
        RequestDelegate next, 
        ILogger<GlobalExceptionMiddleware> logger,
        IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            // عند حدوث تضارب في السحب المتزامن لنفس الرصيد
            DbUpdateConcurrencyException => (
                HttpStatusCode.Conflict, 
                "Another transaction is currently updating this wallet. Please try again."
            ),
            
            ArgumentException or InvalidOperationException => (
                HttpStatusCode.BadRequest, 
                exception.Message
            ),

            _ => (
                HttpStatusCode.InternalServerError, 
                "An unexpected server error occurred."
            )
        };

        context.Response.StatusCode = (int)statusCode;

        var errorResponse = new
        {
            statusCode = context.Response.StatusCode,
            message,
            // إظهار التفاصيل فقط أثناء التطوير وإخفاؤها في بيئة الإنتاج لحماية السيرفر
            detailed = _env.IsDevelopment() ? exception.ToString() : null
        };

        var json = JsonSerializer.Serialize(errorResponse, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        });

        return context.Response.WriteAsync(json);
    }
}