namespace DietApp.Infrastructure.ExternalAuth;

public class GoogleAuthOptions
{
    public const string SectionName = "Google";

    /// <summary>iOS, Android ve (varsa) Web OAuth client ID'leri — id_token'ın "aud" claim'i bunlardan biriyle eşleşmeli.</summary>
    public string[] ClientIds { get; set; } = [];
}
