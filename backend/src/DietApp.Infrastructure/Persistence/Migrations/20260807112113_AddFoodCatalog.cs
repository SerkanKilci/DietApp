using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DietApp.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddFoodCatalog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FoodItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Source = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    ExternalCode = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Brand = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    CaloriesPer100g = table.Column<decimal>(type: "decimal(7,2)", nullable: false),
                    ProteinPer100g = table.Column<decimal>(type: "decimal(7,2)", nullable: false),
                    CarbPer100g = table.Column<decimal>(type: "decimal(7,2)", nullable: false),
                    FatPer100g = table.Column<decimal>(type: "decimal(7,2)", nullable: false),
                    FiberPer100g = table.Column<decimal>(type: "decimal(7,2)", nullable: true),
                    SugarPer100g = table.Column<decimal>(type: "decimal(7,2)", nullable: true),
                    SodiumMgPer100g = table.Column<decimal>(type: "decimal(9,2)", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoodItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FoodItems_Users_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "FoodMicronutrients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FoodItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NutrientCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    AmountPer100g = table.Column<decimal>(type: "decimal(10,4)", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoodMicronutrients", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FoodMicronutrients_FoodItems_FoodItemId",
                        column: x => x.FoodItemId,
                        principalTable: "FoodItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FoodItems_CreatedByUserId",
                table: "FoodItems",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_FoodItems_Name",
                table: "FoodItems",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_FoodItems_Source_ExternalCode",
                table: "FoodItems",
                columns: new[] { "Source", "ExternalCode" });

            migrationBuilder.CreateIndex(
                name: "IX_FoodMicronutrients_FoodItemId_NutrientCode",
                table: "FoodMicronutrients",
                columns: new[] { "FoodItemId", "NutrientCode" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FoodMicronutrients");

            migrationBuilder.DropTable(
                name: "FoodItems");
        }
    }
}
