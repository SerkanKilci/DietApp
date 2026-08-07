using System.Data;
using System.Globalization;
using CsvHelper;
using DietApp.Domain.Enums;
using Microsoft.Data.SqlClient;

namespace DietApp.Tools.FoodImporter;

/// <summary>
/// USDA FoodData Central toplu CSV export'unu (food.csv + food_nutrient.csv + nutrient.csv)
/// FoodItems/FoodMicronutrients tablolarına aktarır.
///
/// Kapsam notu: "Foundation Foods" ve "SR Legacy" veri setleri (onbinlerce temel/çiğ besin) için
/// tasarlandı — bunlar bellekte rahatça tutulabilir. Çok daha büyük "Branded Foods" / "Full Download"
/// setleri için ayrıca bir ara (staging) tablo + toplu SQL join stratejisi gerekir.
/// </summary>
public static class UsdaImporter
{
    private const int BatchSize = 2000;

    // food.csv, gerçek besinlerin yanı sıra USDA'nın dahili laboratuvar/örnek takip kayıtlarını da
    // içerir (sub_sample_food, market_acquisition, agricultural_acquisition, sample_food gibi) —
    // bunlar tüketiciye gösterilecek besin öğeleri değil, sadece bu "gerçek" tipleri aktarıyoruz.
    private static readonly HashSet<string> ConsumerFacingDataTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "foundation_food",
        "sr_legacy_food",
        "survey_fndds_food",
        "branded_food",
    };

    public static async Task RunAsync(string foodCsvPath, string foodNutrientCsvPath, string nutrientCsvPath, string connectionString)
    {
        Console.WriteLine("nutrient.csv okunuyor...");
        var nutrientsById = ReadNutrients(nutrientCsvPath);
        Console.WriteLine($"  {nutrientsById.Count} nutrient tanımı bulundu.");

        Console.WriteLine("food_nutrient.csv okunuyor (bu dosya büyük olabilir, biraz sürebilir)...");
        var nutrientValuesByFood = ReadFoodNutrientValues(foodNutrientCsvPath, nutrientsById);
        Console.WriteLine($"  {nutrientValuesByFood.Count} besin için nutrient verisi toplandı.");

        Console.WriteLine("food.csv okunup SQL Server'a aktarılıyor...");

        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        var foodItemsTable = FoodDataTables.CreateFoodItemsTable();
        var micronutrientsTable = FoodDataTables.CreateFoodMicronutrientsTable();

        using var reader = new StreamReader(foodCsvPath);
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
        var records = csv.GetRecords<UsdaFoodRow>();

        var total = 0;
        var skipped = 0;
        foreach (var food in records)
        {
            if (!ConsumerFacingDataTypes.Contains(food.DataType) || string.IsNullOrWhiteSpace(food.Description))
            {
                skipped++;
                continue;
            }

            var foodItemId = Guid.NewGuid();
            nutrientValuesByFood.TryGetValue(food.FdcId, out var values);
            values ??= new Dictionary<string, decimal>();

            var row = foodItemsTable.NewRow();
            row["Id"] = foodItemId;
            row["Source"] = nameof(FoodSource.Usda);
            row["ExternalCode"] = food.FdcId.ToString(CultureInfo.InvariantCulture);
            row["Name"] = Truncate(food.Description, 256);
            row["Brand"] = DBNull.Value;
            row["CaloriesPer100g"] = GetValue(values, NutrientMapping.Energy);
            row["ProteinPer100g"] = GetValue(values, NutrientMapping.Protein);
            row["CarbPer100g"] = GetValue(values, NutrientMapping.Carbohydrate);
            row["FatPer100g"] = GetValue(values, NutrientMapping.Fat);
            row["FiberPer100g"] = GetNullableValue(values, NutrientMapping.Fiber);
            row["SugarPer100g"] = GetNullableValue(values, NutrientMapping.Sugar);
            row["SodiumMgPer100g"] = GetNullableValue(values, NutrientMapping.Sodium);
            row["CreatedByUserId"] = DBNull.Value;
            row["IsVerified"] = true;
            row["CreatedAt"] = DateTime.UtcNow;
            foodItemsTable.Rows.Add(row);

            foreach (var (nutrientNbr, (code, unit)) in NutrientMapping.Micronutrients)
            {
                if (!values.TryGetValue(nutrientNbr, out var amount) || amount <= 0)
                {
                    continue;
                }

                var microRow = micronutrientsTable.NewRow();
                microRow["Id"] = Guid.NewGuid();
                microRow["FoodItemId"] = foodItemId;
                microRow["NutrientCode"] = code;
                microRow["AmountPer100g"] = amount;
                microRow["Unit"] = unit;
                micronutrientsTable.Rows.Add(microRow);
            }

            total++;

            if (foodItemsTable.Rows.Count >= BatchSize)
            {
                await FlushAsync(connection, foodItemsTable, micronutrientsTable);
                Console.WriteLine($"  ...{total} besin aktarıldı");
            }
        }

        await FlushAsync(connection, foodItemsTable, micronutrientsTable);
        Console.WriteLine($"Tamamlandı: toplam {total} USDA besini aktarıldı ({skipped} dahili/lab kaydı atlandı).");
    }

    private static Dictionary<int, UsdaNutrientRow> ReadNutrients(string path)
    {
        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
        return csv.GetRecords<UsdaNutrientRow>().ToDictionary(n => n.Id);
    }

    private static Dictionary<int, Dictionary<string, decimal>> ReadFoodNutrientValues(
        string path, Dictionary<int, UsdaNutrientRow> nutrientsById)
    {
        var result = new Dictionary<int, Dictionary<string, decimal>>();

        using var reader = new StreamReader(path);
        using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);
        foreach (var row in csv.GetRecords<UsdaFoodNutrientRow>())
        {
            if (!TryParseAmount(row.Amount, out var amount) || !nutrientsById.TryGetValue(row.NutrientId, out var nutrient))
            {
                continue;
            }

            if (!result.TryGetValue(row.FdcId, out var values))
            {
                values = new Dictionary<string, decimal>();
                result[row.FdcId] = values;
            }

            values[nutrient.NutrientNumber] = amount;
        }

        return result;
    }

    private static bool TryParseAmount(string? raw, out decimal amount) =>
        decimal.TryParse(raw, NumberStyles.Float, CultureInfo.InvariantCulture, out amount);

    private static decimal GetValue(Dictionary<string, decimal> values, string nutrientNbr) =>
        values.TryGetValue(nutrientNbr, out var v) ? v : 0m;

    private static object GetNullableValue(Dictionary<string, decimal> values, string nutrientNbr) =>
        values.TryGetValue(nutrientNbr, out var v) ? v : DBNull.Value;

    private static string Truncate(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..maxLength];

    private static async Task FlushAsync(SqlConnection connection, DataTable foodItems, DataTable micronutrients)
    {
        if (foodItems.Rows.Count == 0)
        {
            return;
        }

        using (var bulkCopy = new SqlBulkCopy(connection) { DestinationTableName = "FoodItems" })
        {
            foreach (DataColumn column in foodItems.Columns)
            {
                bulkCopy.ColumnMappings.Add(column.ColumnName, column.ColumnName);
            }

            await bulkCopy.WriteToServerAsync(foodItems);
        }

        if (micronutrients.Rows.Count > 0)
        {
            using var bulkCopy = new SqlBulkCopy(connection) { DestinationTableName = "FoodMicronutrients" };
            foreach (DataColumn column in micronutrients.Columns)
            {
                bulkCopy.ColumnMappings.Add(column.ColumnName, column.ColumnName);
            }

            await bulkCopy.WriteToServerAsync(micronutrients);
        }

        foodItems.Clear();
        micronutrients.Clear();
    }
}
