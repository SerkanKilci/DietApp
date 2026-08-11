using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Data.SqlClient;

namespace DietApp.Tools.FoodImporter;

/// <summary>
/// FoodItems.Name (İngilizce) alanını OpenAI Chat Completions API üzerinden tr/fr/de'ye
/// çevirip FoodItemTranslations tablosuna yazan tek seferlik toplu iş.
/// Zaten "tr" çevirisi olan kayıtlar atlanır — yarıda kesilirse yeniden çalıştırmak güvenlidir.
/// </summary>
public static class FoodTranslationImporter
{
    private static readonly string[] TargetLanguages = ["tr", "fr", "de"];
    private const int BatchSize = 40;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public static async Task RunAsync(string connectionString, string apiKey, string model)
    {
        var pending = await LoadPendingItemsAsync(connectionString);
        Console.WriteLine($"Çevrilecek {pending.Count} besin bulundu (zaten çevrilmiş olanlar hariç).");

        if (pending.Count == 0)
        {
            return;
        }

        using var httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(120) };
        httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var batches = pending.Chunk(BatchSize).ToList();
        var startedAt = DateTime.UtcNow;
        var translatedCount = 0;
        var failedBatches = 0;

        for (var batchIndex = 0; batchIndex < batches.Count; batchIndex++)
        {
            var batch = batches[batchIndex];
            Console.Write($"Parti {batchIndex + 1}/{batches.Count} ({batch.Length} besin)... ");

            List<TranslatedItem>? translations;
            try
            {
                translations = await TranslateBatchAsync(httpClient, model, batch);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"HATA, atlanıyor: {ex.Message}");
                failedBatches++;
                continue;
            }

            if (translations is null || translations.Count == 0)
            {
                Console.WriteLine("boş yanıt, atlanıyor.");
                failedBatches++;
                continue;
            }

            var rowsWritten = await WriteTranslationsAsync(connectionString, batch, translations);
            translatedCount += rowsWritten;
            Console.WriteLine($"tamam ({rowsWritten} besin yazıldı).");
        }

        var elapsed = DateTime.UtcNow - startedAt;
        Console.WriteLine(
            $"Bitti. {translatedCount}/{pending.Count} besin çevrildi, {failedBatches} parti başarısız oldu. Süre: {elapsed:mm\\:ss}.");

        if (failedBatches > 0)
        {
            Console.WriteLine("Başarısız partileri tekrar denemek için aracı tekrar çalıştırabilirsin (zaten çevrilenler atlanır).");
        }
    }

    private static async Task<List<PendingFoodItem>> LoadPendingItemsAsync(string connectionString)
    {
        const string sql = """
            SELECT f.Id, f.Name
            FROM FoodItems f
            WHERE f.Source <> 'UserCreated'
              AND NOT EXISTS (
                  SELECT 1 FROM FoodItemTranslations t WHERE t.FoodItemId = f.Id AND t.LanguageCode = 'tr'
              )
            ORDER BY f.Name
            """;

        var result = new List<PendingFoodItem>();
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();
        await using var command = new SqlCommand(sql, connection) { CommandTimeout = 60 };
        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            result.Add(new PendingFoodItem(reader.GetGuid(0), reader.GetString(1)));
        }

        return result;
    }

    private static async Task<List<TranslatedItem>?> TranslateBatchAsync(
        HttpClient httpClient, string model, PendingFoodItem[] batch)
    {
        var itemsJson = JsonSerializer.Serialize(
            batch.Select((item, index) => new { index, name = item.Name }), JsonOptions);

        var schema = new
        {
            type = "object",
            properties = new
            {
                items = new
                {
                    type = "array",
                    items = new
                    {
                        type = "object",
                        properties = new
                        {
                            index = new { type = "integer" },
                            tr = new { type = "string" },
                            fr = new { type = "string" },
                            de = new { type = "string" },
                        },
                        required = new[] { "index", "tr", "fr", "de" },
                        additionalProperties = false,
                    },
                },
            },
            required = new[] { "items" },
            additionalProperties = false,
        };

        var requestBody = new
        {
            model,
            max_tokens = 6000,
            messages = new object[]
            {
                new
                {
                    role = "system",
                    content =
                        "You are a professional food and nutrition label translator. You will receive a JSON array of " +
                        "food/product names in English, each with an index. For every item, provide natural, concise " +
                        "translations into Turkish (tr), French (fr), and German (de) — the way these foods are " +
                        "commonly named in a grocery store or nutrition app in each language. Keep brand names and " +
                        "proper nouns unchanged. Do not add extra descriptive words or explanations. Return exactly " +
                        "one output item per input item, using the same index.",
                },
                new { role = "user", content = itemsJson },
            },
            response_format = new
            {
                type = "json_schema",
                json_schema = new { name = "food_translations", strict = true, schema },
            },
        };

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.openai.com/v1/chat/completions")
        {
            Content = new StringContent(JsonSerializer.Serialize(requestBody, JsonOptions), Encoding.UTF8, "application/json"),
        };

        using var response = await httpClient.SendAsync(request);
        var responseJson = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"OpenAI isteği başarısız ({(int)response.StatusCode}): {responseJson}");
        }

        var completion = JsonSerializer.Deserialize<ChatCompletionResponse>(responseJson, JsonOptions)
            ?? throw new InvalidOperationException("OpenAI yanıtı ayrıştırılamadı.");

        var content = completion.Choices.FirstOrDefault()?.Message.Content
            ?? throw new InvalidOperationException("OpenAI yanıtında içerik yok.");

        var payload = JsonSerializer.Deserialize<TranslationPayload>(content, JsonOptions)
            ?? throw new InvalidOperationException("OpenAI yanıtındaki JSON ayrıştırılamadı.");

        return payload.Items;
    }

    private static async Task<int> WriteTranslationsAsync(
        string connectionString, PendingFoodItem[] batch, List<TranslatedItem> translations)
    {
        var table = FoodDataTables.CreateFoodItemTranslationsTable();

        foreach (var translated in translations)
        {
            if (translated.Index < 0 || translated.Index >= batch.Length)
            {
                continue;
            }

            var foodItemId = batch[translated.Index].Id;
            AddRowIfPresent(table, foodItemId, "tr", translated.Tr);
            AddRowIfPresent(table, foodItemId, "fr", translated.Fr);
            AddRowIfPresent(table, foodItemId, "de", translated.De);
        }

        if (table.Rows.Count == 0)
        {
            return 0;
        }

        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();
        using var bulkCopy = new Microsoft.Data.SqlClient.SqlBulkCopy(connection) { DestinationTableName = "FoodItemTranslations" };
        foreach (System.Data.DataColumn column in table.Columns)
        {
            bulkCopy.ColumnMappings.Add(column.ColumnName, column.ColumnName);
        }

        await bulkCopy.WriteToServerAsync(table);

        return table.Rows.Count / TargetLanguages.Length;
    }

    private static void AddRowIfPresent(System.Data.DataTable table, Guid foodItemId, string languageCode, string? name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return;
        }

        var row = table.NewRow();
        row["Id"] = Guid.NewGuid();
        row["FoodItemId"] = foodItemId;
        row["LanguageCode"] = languageCode;
        row["Name"] = name.Length > 256 ? name[..256] : name;
        table.Rows.Add(row);
    }

    private record PendingFoodItem(Guid Id, string Name);

    private class ChatCompletionResponse
    {
        [JsonPropertyName("choices")]
        public List<ChatChoice> Choices { get; set; } = [];
    }

    private class ChatChoice
    {
        [JsonPropertyName("message")]
        public ChatResponseMessage Message { get; set; } = default!;
    }

    private class ChatResponseMessage
    {
        [JsonPropertyName("content")]
        public string Content { get; set; } = default!;
    }

    private class TranslationPayload
    {
        [JsonPropertyName("items")]
        public List<TranslatedItem> Items { get; set; } = [];
    }

    private class TranslatedItem
    {
        [JsonPropertyName("index")]
        public int Index { get; set; }

        [JsonPropertyName("tr")]
        public string? Tr { get; set; }

        [JsonPropertyName("fr")]
        public string? Fr { get; set; }

        [JsonPropertyName("de")]
        public string? De { get; set; }
    }
}
