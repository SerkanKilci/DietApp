using CsvHelper.Configuration.Attributes;

namespace DietApp.Tools.FoodImporter;

// USDA FoodData Central toplu CSV export'unun (food.csv) gerçek kolon adları.
public class UsdaFoodRow
{
    [Name("fdc_id")]
    public int FdcId { get; set; }

    [Name("data_type")]
    public string DataType { get; set; } = default!;

    [Name("description")]
    public string Description { get; set; } = default!;
}

// food_nutrient.csv — her satır bir (besin, nutrient) ikilisi için ölçülen miktar.
public class UsdaFoodNutrientRow
{
    [Name("fdc_id")]
    public int FdcId { get; set; }

    [Name("nutrient_id")]
    public int NutrientId { get; set; }

    // string olarak okunuyor: bazı satırlar "5.625E-4" gibi bilimsel gösterim kullanıyor,
    // decimal.Parse bunu NumberStyles.Float olmadan kabul etmiyor (bkz. UsdaImporter.ParseAmount).
    [Name("amount")]
    public string? Amount { get; set; }
}

// nutrient.csv — nutrient_id'nin neye karşılık geldiği (ör. 208 = Enerji).
public class UsdaNutrientRow
{
    [Name("id")]
    public int Id { get; set; }

    [Name("name")]
    public string Name { get; set; } = default!;

    [Name("unit_name")]
    public string UnitName { get; set; } = default!;

    [Name("nutrient_nbr")]
    public string NutrientNumber { get; set; } = default!;
}
