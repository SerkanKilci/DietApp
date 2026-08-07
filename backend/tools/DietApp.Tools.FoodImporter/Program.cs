using DietApp.Tools.FoodImporter;
using Microsoft.Extensions.Configuration;

var configuration = new ConfigurationBuilder()
    .SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.json", optional: false)
    .Build();

var connectionString = configuration.GetConnectionString("DietAppDb")
    ?? throw new InvalidOperationException("appsettings.json içinde ConnectionStrings:DietAppDb eksik.");

if (args.Length == 0)
{
    PrintUsage();
    return 1;
}

switch (args[0].ToLowerInvariant())
{
    case "usda":
        if (args.Length < 4)
        {
            Console.WriteLine("Kullanım: usda <food.csv> <food_nutrient.csv> <nutrient.csv>");
            return 1;
        }
        await UsdaImporter.RunAsync(args[1], args[2], args[3], connectionString);
        return 0;

    case "off":
        if (args.Length < 2)
        {
            Console.WriteLine("Kullanım: off <products.csv>");
            return 1;
        }
        await OpenFoodFactsImporter.RunAsync(args[1], connectionString);
        return 0;

    default:
        PrintUsage();
        return 1;
}

static void PrintUsage()
{
    Console.WriteLine("""
        DietApp.Tools.FoodImporter — USDA FoodData Central ve Open Food Facts toplu import aracı.

        Kullanım:
          dotnet run -- usda <food.csv> <food_nutrient.csv> <nutrient.csv>
          dotnet run -- off <products.csv>

        Dosyaları nereden indireceğin:
          USDA:  https://fdc.nal.usda.gov/download-datasets  ("Foundation Foods" veya "SR Legacy" öner.)
          OFF:   https://world.openfoodfacts.org/data  (products.csv.gz — indirip gzip'ten çıkar.)

        Bağlantı dizesi appsettings.json içindeki ConnectionStrings:DietAppDb'den okunur.
        """);
}
