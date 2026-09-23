using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NovaPay.Models;
using NovaPay.Services;

namespace NovaPay.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    /// <summary>
    /// Step 1: User calls this to initiate a Stripe deposit
    /// </summary>
    [Authorize]
    [HttpPost("create-intent")]
    public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentIntentRequest request)
    {
        // Extract the logged-in user's ID from JWT token claims
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Invalid user token." });
        }

        var (success, errorMessage, response) = await _paymentService.CreatePaymentIntentAsync(userId, request.Amount);

        if (!success)
        {
            return BadRequest(new { message = errorMessage });
        }

        return Ok(response);
    }

    /// <summary>
    /// Step 2: Stripe server calls this webhook when the user completes payment
    /// Notice: [AllowAnonymous] because Stripe's servers do not carry your JWT token!
    /// Security is handled via the Stripe-Signature header.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<IActionResult> StripeWebhook()
    {
        // 1. Read the raw body stream as text
        // (Must NOT deserialize using [FromBody] because that breaks cryptographic hashing)
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

        // 2. Read the Stripe-Signature header
        var stripeSignature = Request.Headers["Stripe-Signature"].ToString();

        if (string.IsNullOrEmpty(stripeSignature))
        {
            return BadRequest(new { message = "Missing Stripe-Signature header." });
        }

        // 3. Process the event
        var success = await _paymentService.HandleWebhookAsync(json, stripeSignature);

        if (!success)
        {
            return BadRequest(new { message = "Webhook signature verification failed." });
        }

        // Always return 200 OK to Stripe
        return Ok();
    }
}