using System.Data;

namespace DietApp.Tools.FoodImporter;

/// <summary>
/// FoodItems / FoodMicronutrients tablolarının gerçek şemasıyla birebir eşleşen DataTable'lar —
/// SqlBulkCopy'nin hedef tabloyla kolon kolon eşleşmesi gerekiyor (bkz. AddFoodCatalog migration'ı).
/// </summary>
public static class FoodDataTables
{
    public static DataTable CreateFoodItemsTable()
    {
        var table = new DataTable("FoodItems");
        table.Columns.Add("Id", typeof(Guid));
        table.Columns.Add("Source", typeof(string));
        table.Columns.Add("ExternalCode", typeof(string));
        table.Columns.Add("Name", typeof(string));
        table.Columns.Add("Brand", typeof(string));
        table.Columns.Add("CaloriesPer100g", typeof(decimal));
        table.Columns.Add("ProteinPer100g", typeof(decimal));
        table.Columns.Add("CarbPer100g", typeof(decimal));
        table.Columns.Add("FatPer100g", typeof(decimal));
        table.Columns.Add("FiberPer100g", typeof(decimal));
        table.Columns.Add("SugarPer100g", typeof(decimal));
        table.Columns.Add("SodiumMgPer100g", typeof(decimal));
        table.Columns.Add("CreatedByUserId", typeof(Guid));
        table.Columns.Add("IsVerified", typeof(bool));
        table.Columns.Add("CreatedAt", typeof(DateTime));
        return table;
    }

    public static DataTable CreateFoodMicronutrientsTable()
    {
        var table = new DataTable("FoodMicronutrients");
        table.Columns.Add("Id", typeof(Guid));
        table.Columns.Add("FoodItemId", typeof(Guid));
        table.Columns.Add("NutrientCode", typeof(string));
        table.Columns.Add("AmountPer100g", typeof(decimal));
        table.Columns.Add("Unit", typeof(string));
        return table;
    }
}
