using DietApp.Api.Models;
using DietApp.Application.DTOs;
using DietApp.Application.Services;
using DietApp.Infrastructure.RevenueCat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace DietApp.Api.Controllers;

[Route("api/subscriptions")]
public class SubscriptionsController(ISubscriptionService subscriptionService, IOptions<RevenueCatOptions> options) : ApiControllerBase
{
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<SubscriptionStatusDto>> GetMe(CancellationToken ct) =>
        await subscriptionService.GetStatusAsync(CurrentUserId, ct);

    // RevenueCat dashboard'dan çağrılır — kullanıcının kendi JWT'si değil, dashboard'da
    // tanımlanan sabit bir secret ile doğrulanır (bkz. appsettings.Development.json: RevenueCat:WebhookSecret).
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook([FromBody] RevenueCatWebhookPayload payload, CancellationToken ct)
    {
        var expectedSecret = options.Value.WebhookSecret;
        if (!string.IsNullOrEmpty(expectedSecret) && Request.Headers.Authorization != $"Bearer {expectedSecret}")
        {
            return Unauthorized();
        }

        if (payload.Event is null || !Guid.TryParse(payload.Event.AppUserId, out var userId))
        {
            // Henüz giriş yapmamış (anonim) bir RevenueCat kullanıcısına ait event ya da tanımadığımız
            // bir ID — bize ait bir hesap değil, sessizce yok sayılır (200 döner ki RevenueCat tekrar denemesin).
            return Ok();
        }

        var expiresAt = payload.Event.ExpirationAtMs.HasValue
            ? DateTimeOffset.FromUnixTimeMilliseconds(payload.Event.ExpirationAtMs.Value).UtcDateTime
            : (DateTime?)null;

        await subscriptionService.HandleWebhookEventAsync(
            userId,
            payload.Event.Type,
            payload.Event.ProductId,
            payload.Event.EntitlementIds?.FirstOrDefault(),
            expiresAt,
            ct);

        return Ok();
    }
}
