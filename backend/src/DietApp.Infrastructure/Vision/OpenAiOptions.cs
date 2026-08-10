namespace DietApp.Infrastructure.Vision;

public class OpenAiOptions
{
    public const string SectionName = "OpenAi";

    public string ApiKey { get; set; } = default!;

    /// <summary>Vision destekli bir model olmalı. OpenAI'nin model listesi zamanla değişir, ihtiyaca göre güncelle.</summary>
    public string Model { get; set; } = "gpt-4o-mini";
}
