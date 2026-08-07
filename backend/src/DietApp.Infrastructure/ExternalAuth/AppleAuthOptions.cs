namespace DietApp.Infrastructure.ExternalAuth;

public class AppleAuthOptions
{
    public const string SectionName = "Apple";

    /// <summary>iOS Bundle ID (native "Sign in with Apple" akışında id_token'ın "aud" claim'i budur).</summary>
    public string[] ClientIds { get; set; } = [];
}
