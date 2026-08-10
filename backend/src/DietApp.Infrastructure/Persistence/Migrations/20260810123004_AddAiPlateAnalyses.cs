using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DietApp.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAiPlateAnalyses : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AiPlateAnalyses",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    EstimatedCalories = table.Column<int>(type: "int", nullable: false),
                    EstimatedProteinG = table.Column<int>(type: "int", nullable: false),
                    EstimatedCarbG = table.Column<int>(type: "int", nullable: false),
                    EstimatedFatG = table.Column<int>(type: "int", nullable: false),
                    RawResponseJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiPlateAnalyses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AiPlateAnalyses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AiPlateAnalyses_UserId_CreatedAt",
                table: "AiPlateAnalyses",
                columns: new[] { "UserId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AiPlateAnalyses");
        }
    }
}
