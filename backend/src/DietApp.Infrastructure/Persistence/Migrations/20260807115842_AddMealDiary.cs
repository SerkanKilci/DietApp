using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DietApp.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMealDiary : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MealEntries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LogDate = table.Column<DateOnly>(type: "date", nullable: false),
                    MealType = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    LoggedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealEntries_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MealEntryItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MealEntryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FoodItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CustomDescription = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    QuantityG = table.Column<decimal>(type: "decimal(7,2)", nullable: false),
                    CaloriesTotal = table.Column<decimal>(type: "decimal(7,2)", nullable: false),
                    ProteinTotal = table.Column<decimal>(type: "decimal(7,2)", nullable: false),
                    CarbTotal = table.Column<decimal>(type: "decimal(7,2)", nullable: false),
                    FatTotal = table.Column<decimal>(type: "decimal(7,2)", nullable: false),
                    IsAiEstimated = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealEntryItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MealEntryItems_FoodItems_FoodItemId",
                        column: x => x.FoodItemId,
                        principalTable: "FoodItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MealEntryItems_MealEntries_MealEntryId",
                        column: x => x.MealEntryId,
                        principalTable: "MealEntries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MealEntries_UserId_LogDate_MealType",
                table: "MealEntries",
                columns: new[] { "UserId", "LogDate", "MealType" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MealEntryItems_FoodItemId",
                table: "MealEntryItems",
                column: "FoodItemId");

            migrationBuilder.CreateIndex(
                name: "IX_MealEntryItems_MealEntryId",
                table: "MealEntryItems",
                column: "MealEntryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MealEntryItems");

            migrationBuilder.DropTable(
                name: "MealEntries");
        }
    }
}
