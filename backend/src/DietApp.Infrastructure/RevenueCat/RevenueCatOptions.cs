namespace DietApp.Infrastructure.RevenueCat;

public class RevenueCatOptions
{
    public const string SectionName = "RevenueCat";

    /// <summary>
    /// RevenueCat dashboard'da webhook için tanımlanan "Authorization header value" — gelen isteklerin
    /// gerçekten RevenueCat'ten geldiğini doğrulamak için kullanılır (bkz. SubscriptionsController).
    /// </summary>
    public string WebhookSecret { get; set; } = default!;

    /// <summary>Premium erişimi açan entitlement kimliği (RevenueCat dashboard'da tanımlanır, ör. "premium").</summary>
    public string EntitlementId { get; set; } = "premium";
}
