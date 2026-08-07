using CsvHelper.Configuration.Attributes;

namespace DietApp.Tools.FoodImporter;

// Open Food Facts'in toplu ürün export'u (tab-ayraçlı .csv) — gerçek kolon adları.
// İndirme: https://world.openfoodfacts.org/data (products.csv.gz)
public class OffProductRow
{
    [Name("code")]
    public string Code { get; set; } = default!;

    [Name("product_name")]
    public string? ProductName { get; set; }

    [Name("brands")]
    public string? Brands { get; set; }

    [Name("energy-kcal_100g")]
    public decimal? EnergyKcal100g { get; set; }

    [Name("proteins_100g")]
    public decimal? Proteins100g { get; set; }

    [Name("carbohydrates_100g")]
    public decimal? Carbohydrates100g { get; set; }

    [Name("fat_100g")]
    public decimal? Fat100g { get; set; }

    [Name("fiber_100g")]
    public decimal? Fiber100g { get; set; }

    [Name("sugars_100g")]
    public decimal? Sugars100g { get; set; }

    [Name("sodium_100g")]
    public decimal? Sodium100g { get; set; }
}
