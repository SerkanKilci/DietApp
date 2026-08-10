using System.Text.Json.Serialization;

namespace DietApp.Infrastructure.Vision;

// OpenAI Chat Completions API (vision + Structured Outputs) için minimal istek/yanıt modelleri.
// Referans: https://platform.openai.com/docs/guides/vision , https://platform.openai.com/docs/guides/structured-outputs

internal class ChatCompletionRequest
{
    [JsonPropertyName("model")]
    public string Model { get; set; } = default!;

    [JsonPropertyName("messages")]
    public List<ChatMessage> Messages { get; set; } = [];

    [JsonPropertyName("response_format")]
    public ResponseFormat ResponseFormat { get; set; } = default!;

    [JsonPropertyName("max_tokens")]
    public int MaxTokens { get; set; }
}

internal class ChatMessage
{
    [JsonPropertyName("role")]
    public string Role { get; set; } = default!;

    /// <summary>System mesajı için string, kullanıcı mesajı için List&lt;ContentPart&gt; (metin + görsel).</summary>
    [JsonPropertyName("content")]
    public object Content { get; set; } = default!;
}

internal class ContentPart
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = default!;

    [JsonPropertyName("text")]
    public string? Text { get; set; }

    [JsonPropertyName("image_url")]
    public ImageUrlContent? ImageUrl { get; set; }
}

internal class ImageUrlContent
{
    [JsonPropertyName("url")]
    public string Url { get; set; } = default!;
}

internal class ResponseFormat
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "json_schema";

    [JsonPropertyName("json_schema")]
    public JsonSchemaWrapper JsonSchema { get; set; } = default!;
}

internal class JsonSchemaWrapper
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = default!;

    [JsonPropertyName("strict")]
    public bool Strict { get; set; } = true;

    [JsonPropertyName("schema")]
    public object Schema { get; set; } = default!;
}

internal class ChatCompletionResponse
{
    [JsonPropertyName("choices")]
    public List<ChatChoice> Choices { get; set; } = [];
}

internal class ChatChoice
{
    [JsonPropertyName("message")]
    public ChatResponseMessage Message { get; set; } = default!;
}

internal class ChatResponseMessage
{
    [JsonPropertyName("content")]
    public string Content { get; set; } = default!;
}

internal class PlateAnalysisPayload
{
    [JsonPropertyName("description")]
    public string Description { get; set; } = default!;

    [JsonPropertyName("calories")]
    public int Calories { get; set; }

    [JsonPropertyName("proteinG")]
    public int ProteinG { get; set; }

    [JsonPropertyName("carbG")]
    public int CarbG { get; set; }

    [JsonPropertyName("fatG")]
    public int FatG { get; set; }
}
