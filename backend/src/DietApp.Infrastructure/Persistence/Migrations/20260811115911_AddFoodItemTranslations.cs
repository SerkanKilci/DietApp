using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DietApp.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddFoodItemTranslations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FoodItemTranslations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FoodItemId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LanguageCode = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FoodItemTranslations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FoodItemTranslations_FoodItems_FoodItemId",
                        column: x => x.FoodItemId,
                        principalTable: "FoodItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FoodItemTranslations_FoodItemId_LanguageCode",
                table: "FoodItemTranslations",
                columns: new[] { "FoodItemId", "LanguageCode" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FoodItemTranslations");
        }
    }
}
