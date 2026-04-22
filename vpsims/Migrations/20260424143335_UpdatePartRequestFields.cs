using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace vpsims.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePartRequestFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PartNumber",
                table: "part_requests",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "part_requests",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "part_requests",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "VehicleModel",
                table: "part_requests",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PartNumber",
                table: "part_requests");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "part_requests");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "part_requests");

            migrationBuilder.DropColumn(
                name: "VehicleModel",
                table: "part_requests");
        }
    }
}
