using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DietApp.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOnboarding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "NutritionGoals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DailyCalories = table.Column<int>(type: "int", nullable: false),
                    ProteinG = table.Column<int>(type: "int", nullable: false),
                    CarbG = table.Column<int>(type: "int", nullable: false),
                    FatG = table.Column<int>(type: "int", nullable: false),
                    EffectiveFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NutritionGoals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NutritionGoals_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserProfiles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HeightCm = table.Column<int>(type: "int", nullable: false),
                    WeightKg = table.Column<decimal>(type: "decimal(5,2)", nullable: false),
                    BirthDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Gender = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    ActivityLevel = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    Goal = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    GoalWeightKg = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserProfiles", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NutritionGoals_UserId_EffectiveFrom",
                table: "NutritionGoals",
                columns: new[] { "UserId", "EffectiveFrom" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NutritionGoals");

            migrationBuilder.DropTable(
                name: "UserProfiles");
        }
    }
}
