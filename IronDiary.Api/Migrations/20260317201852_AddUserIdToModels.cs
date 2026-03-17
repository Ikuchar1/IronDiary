using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IronDiary.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "WorkoutPhotos",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "WorkoutLogs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "RestDays",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "BodyWeightLogs",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "WorkoutPhotos");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "WorkoutLogs");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "RestDays");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "BodyWeightLogs");
        }
    }
}
