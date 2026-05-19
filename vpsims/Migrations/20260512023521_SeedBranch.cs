using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace vpsims.Migrations
{
    /// <inheritdoc />
    public partial class SeedBranch : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "branches",
                columns: new[] { "Id", "Address", "IsActive", "Latitude", "Longitude", "Name", "Phone" },
                values: new object[] { 1, "123 Auto Lane", true, 40.712800000000001, -74.006, "Main Service Center", "555-0100" });

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 12, 2, 35, 21, 160, DateTimeKind.Utc).AddTicks(2101));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 12, 2, 35, 21, 160, DateTimeKind.Utc).AddTicks(3226));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 12, 2, 35, 21, 160, DateTimeKind.Utc).AddTicks(3227));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 12, 2, 35, 21, 160, DateTimeKind.Utc).AddTicks(3229));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "branches",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 12, 2, 9, 34, 870, DateTimeKind.Utc).AddTicks(1016));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 12, 2, 9, 34, 870, DateTimeKind.Utc).AddTicks(1959));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 12, 2, 9, 34, 870, DateTimeKind.Utc).AddTicks(1961));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 5, 12, 2, 9, 34, 870, DateTimeKind.Utc).AddTicks(1962));
        }
    }
}
