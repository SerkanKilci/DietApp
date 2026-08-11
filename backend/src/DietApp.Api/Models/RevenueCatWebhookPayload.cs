using System.Text.Json.Serialization;

namespace DietApp.Api.Models;

// RevenueCat webhook JSON şeması (snake_case) — https://www.revenuecat.com/docs/integrations/webhooks
public class RevenueCatWebhookPayload
{
    [JsonPropertyName("event")]
    public RevenueCatEvent? Event { get; set; }
}

public class RevenueCatEvent
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = default!;

    [JsonPropertyName("app_user_id")]
    public string AppUserId { get; set; } = default!;

    [JsonPropertyName("product_id")]
    public string? ProductId { get; set; }

    [JsonPropertyName("entitlement_ids")]
    public List<string>? EntitlementIds { get; set; }

    [JsonPropertyName("expiration_at_ms")]
    public long? ExpirationAtMs { get; set; }
}
