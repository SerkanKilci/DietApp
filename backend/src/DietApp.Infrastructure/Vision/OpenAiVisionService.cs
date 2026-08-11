using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using DietApp.Application.Abstractions;
using Microsoft.Extensions.Options;

namespace DietApp.Infrastructure.Vision;

public class OpenAiVisionService(IHttpClientFactory httpClientFactory, IOptions<OpenAiOptions> options) : IVisionAnalysisService
{
    private static readonly JsonSerializerOptions RequestJsonOptions = new()
    {
        DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
    };

    private static readonly object PlateAnalysisSchema = new
    {
        type = "object",
        properties = new
        {
            description = new { type = "string" },
            calories = new { type = "integer" },
            proteinG = new { type = "integer" },
            carbG = new { type = "integer" },
            fatG = new { type = "integer" },
        },
        required = new[] { "description", "calories", "proteinG", "carbG", "fatG" },
        additionalProperties = false,
    };

    public async Task<VisionAnalysisResult> AnalyzePlateAsync(byte[] imageBytes, string contentType, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(options.Value.ApiKey))
        {
            throw new InvalidOperationException("OpenAI API anahtarı yapılandırılmamış (OpenAi:ApiKey appsettings.Development.json içinde olmalı).");
        }

        var dataUrl = $"data:{contentType};base64,{Convert.ToBase64String(imageBytes)}";

        var requestBody = new ChatCompletionRequest
        {
            Model = options.Value.Model,
            MaxTokens = 500,
            Messages =
            [
                new ChatMessage
                {
                    Role = "system",
                    Content =
                        "Sen bir beslenme uzmanısın. Kullanıcının gönderdiği tabak fotoğrafındaki yemeği analiz edip " +
                        "TAHMİNİ toplam kalori ve makro besin değerlerini veriyorsun. 'description' alanına tabakta " +
                        "ne gördüğünü özetleyen kısa bir Türkçe cümle yaz. Emin olmasan bile en makul tahminini ver, " +
                        "asla alanları boş bırakma.",
                },
                new ChatMessage
                {
                    Role = "user",
                    Content = new List<ContentPart>
                    {
                        new() { Type = "text", Text = "Bu tabaktaki yemeğin toplam kalori ve makro besin değerlerini tahmin et." },
                        new() { Type = "image_url", ImageUrl = new ImageUrlContent { Url = dataUrl } },
                    },
                },
            ],
            ResponseFormat = new ResponseFormat
            {
                Type = "json_schema",
                JsonSchema = new JsonSchemaWrapper { Name = "plate_analysis", Strict = true, Schema = PlateAnalysisSchema },
            },
        };

        var client = httpClientFactory.CreateClient(nameof(OpenAiVisionService));
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions")
        {
            Content = JsonContent.Create(requestBody, options: RequestJsonOptions),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", options.Value.ApiKey);

        using var response = await client.SendAsync(request, ct);
        var responseJson = await response.Content.ReadAsStringAsync(ct);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"OpenAI isteği başarısız oldu ({(int)response.StatusCode}): {responseJson}");
        }

        var completion = JsonSerializer.Deserialize<ChatCompletionResponse>(responseJson)
            ?? throw new InvalidOperationException("OpenAI yanıtı ayrıştırılamadı.");

        var content = completion.Choices.FirstOrDefault()?.Message.Content
            ?? throw new InvalidOperationException("OpenAI yanıtında içerik yok.");

        var payload = JsonSerializer.Deserialize<PlateAnalysisPayload>(content)
            ?? throw new InvalidOperationException("OpenAI yanıtındaki JSON ayrıştırılamadı.");

        return new VisionAnalysisResult(payload.Description, payload.Calories, payload.ProteinG, payload.CarbG, payload.FatG, responseJson);
    }
}
