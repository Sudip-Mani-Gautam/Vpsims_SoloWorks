using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace vpsims.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVendorInventoryModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastServiceDate",
                table: "vehicles",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Mileage",
                table: "vehicles",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "suppliers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Brand",
                table: "parts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompatibleVehicleModel",
                table: "parts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeliveryTime",
                table: "parts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MarginAmount",
                table: "parts",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "MarginPercentage",
                table: "parts",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "MarginType",
                table: "parts",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "MinimumOrderQuantity",
                table: "parts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MinimumStockAlertLevel",
                table: "parts",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "parts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RackLocation",
                table: "parts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WarrantyPeriod",
                table: "parts",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 4, 29, 21, 542, DateTimeKind.Utc).AddTicks(197));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 4, 29, 21, 542, DateTimeKind.Utc).AddTicks(1254));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 4, 29, 21, 542, DateTimeKind.Utc).AddTicks(1256));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 28, 4, 29, 21, 542, DateTimeKind.Utc).AddTicks(1258));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastServiceDate",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "Mileage",
                table: "vehicles");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "suppliers");

            migrationBuilder.DropColumn(
                name: "Brand",
                table: "parts");

            migrationBuilder.DropColumn(
                name: "CompatibleVehicleModel",
                table: "parts");

            migrationBuilder.DropColumn(
                name: "DeliveryTime",
                table: "parts");

            migrationBuilder.DropColumn(
                name: "MarginAmount",
                table: "parts");

            migrationBuilder.DropColumn(
                name: "MarginPercentage",
                table: "parts");

            migrationBuilder.DropColumn(
                name: "MarginType",
                table: "parts");

            migrationBuilder.DropColumn(
                name: "MinimumOrderQuantity",
                table: "parts");

            migrationBuilder.DropColumn(
                name: "MinimumStockAlertLevel",
                table: "parts");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "parts");

            migrationBuilder.DropColumn(
                name: "RackLocation",
                table: "parts");

            migrationBuilder.DropColumn(
                name: "WarrantyPeriod",
                table: "parts");

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 12, 33, 47, 790, DateTimeKind.Utc).AddTicks(3547));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 12, 33, 47, 790, DateTimeKind.Utc).AddTicks(5088));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 12, 33, 47, 790, DateTimeKind.Utc).AddTicks(5090));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 12, 33, 47, 790, DateTimeKind.Utc).AddTicks(5092));
        }
    }
}
