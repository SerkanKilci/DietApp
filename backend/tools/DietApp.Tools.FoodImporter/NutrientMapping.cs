namespace DietApp.Tools.FoodImporter;

/// <summary>
/// USDA'nın stabil "nutrient_nbr" kodlarını bizim şemamıza eşler.
/// Referans: https://fdc.nal.usda.gov/ nutrient.csv içindeki nutrient_nbr sütunu.
/// </summary>
public static class NutrientMapping
{
    public const string Energy = "208";
    public const string Protein = "203";
    public const string Fat = "204";
    public const string Carbohydrate = "205";
    public const string Fiber = "291";
    public const string Sugar = "269";
    public const string Sodium = "307";

    // FoodMicronutrients'a aktarılacak seçili mikro besinler: nutrient_nbr -> (bizim kodumuz, birim).
    public static readonly Dictionary<string, (string Code, string Unit)> Micronutrients = new()
    {
        ["301"] = ("CALCIUM", "MG"),
        ["303"] = ("IRON", "MG"),
        ["306"] = ("POTASSIUM", "MG"),
        ["401"] = ("VITAMIN_C", "MG"),
        ["320"] = ("VITAMIN_A", "MCG"),
        ["328"] = ("VITAMIN_D", "MCG"),
        ["418"] = ("VITAMIN_B12", "MCG"),
        ["304"] = ("MAGNESIUM", "MG"),
        ["309"] = ("ZINC", "MG"),
    };
}
