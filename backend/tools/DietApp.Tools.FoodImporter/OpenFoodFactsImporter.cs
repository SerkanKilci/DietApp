using System.Data;
using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using DietApp.Domain.Enums;
using Microsoft.Data.SqlClient;

namespace DietApp.Tools.FoodImporter;

/// <summary>
/// Open Food Facts toplu ürün export'unu (products.csv, tab-ayraçlı) FoodItems'a aktarır.
/// Veri kalitesi karışıktır (kullanıcı katkılı) — temel besin değerleri eksik veya saçma
/// (ör. negatif, %100g'ı aşan) satırlar atlanır.
/// </summary>
public static class OpenFoodFactsImporter
{
    private const int BatchSize = 2000;

    public static async Task RunAsync(string productsCsvPath, string connectionString)
    {
        using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            Delimiter = "\t",
            BadDataFound = null,
            MissingFieldFound = null,
        };

        using var reader = new StreamReader(productsCsvPath);
        using var csv = new CsvReader(reader, config);

        var foodItemsTable = FoodDataTables.CreateFoodItemsTable();
        var total = 0;
        var skipped = 0;

        await foreach (var product in csv.GetRecordsAsync<OffProductRow>())
        {
            if (!IsUsable(product))
            {
                skipped++;
                continue;
            }

            var row = foodItemsTable.NewRow();
            row["Id"] = Guid.NewGuid();
            row["Source"] = nameof(FoodSource.OpenFoodFacts);
            row["ExternalCode"] = product.Code;
            row["Name"] = Truncate(product.ProductName!, 256);
            row["Brand"] = product.Brands is null ? DBNull.Value : Truncate(product.Brands, 128);
            row["CaloriesPer100g"] = product.EnergyKcal100g!.Value;
            row["ProteinPer100g"] = product.Proteins100g!.Value;
            row["CarbPer100g"] = product.Carbohydrates100g!.Value;
            row["FatPer100g"] = product.Fat100g!.Value;
            row["FiberPer100g"] = (object?)product.Fiber100g ?? DBNull.Value;
            row["SugarPer100g"] = (object?)product.Sugars100g ?? DBNull.Value;
            // OFF sodyumu gram cinsinden verir, bizim şemamız mg bekliyor.
            row["SodiumMgPer100g"] = product.Sodium100g.HasValue ? product.Sodium100g.Value * 1000 : DBNull.Value;
            row["CreatedByUserId"] = DBNull.Value;
            row["IsVerified"] = false;
            row["CreatedAt"] = DateTime.UtcNow;
            foodItemsTable.Rows.Add(row);
            total++;

            if (foodItemsTable.Rows.Count >= BatchSize)
            {
                await FlushAsync(connection, foodItemsTable);
                Console.WriteLine($"  ...{total} ürün aktarıldı ({skipped} eksik/geçersiz veri nedeniyle atlandı)");
            }
        }

        await FlushAsync(connection, foodItemsTable);
        Console.WriteLine($"Tamamlandı: {total} Open Food Facts ürünü aktarıldı, {skipped} satır atlandı.");
    }

    private static bool IsUsable(OffProductRow p)
    {
        if (string.IsNullOrWhiteSpace(p.Code) || string.IsNullOrWhiteSpace(p.ProductName))
        {
            return false;
        }

        if (p.EnergyKcal100g is not { } kcal || p.Proteins100g is not { } protein ||
            p.Carbohydrates100g is not { } carb || p.Fat100g is not { } fat)
        {
            return false;
        }

        if (kcal is < 0 or > 900 || protein is < 0 or > 105 || carb is < 0 or > 105 || fat is < 0 or > 105)
        {
            return false;
        }

        return true;
    }

    private static string Truncate(string value, int maxLength) =>
        value.Length <= maxLength ? value : value[..maxLength];

    private static async Task FlushAsync(SqlConnection connection, DataTable foodItems)
    {
        if (foodItems.Rows.Count == 0)
        {
            return;
        }

        using var bulkCopy = new SqlBulkCopy(connection) { DestinationTableName = "FoodItems" };
        foreach (DataColumn column in foodItems.Columns)
        {
            bulkCopy.ColumnMappings.Add(column.ColumnName, column.ColumnName);
        }

        await bulkCopy.WriteToServerAsync(foodItems);
        foodItems.Clear();
    }
}
