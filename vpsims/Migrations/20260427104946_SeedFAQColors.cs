using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace vpsims.Migrations
{
    /// <inheritdoc />
    public partial class SeedFAQColors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "HexColor" },
                values: new object[] { new DateTime(2026, 4, 27, 10, 49, 45, 436, DateTimeKind.Utc).AddTicks(189), "Purple" });

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "HexColor" },
                values: new object[] { new DateTime(2026, 4, 27, 10, 49, 45, 436, DateTimeKind.Utc).AddTicks(1229), "Yellow" });

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "HexColor" },
                values: new object[] { new DateTime(2026, 4, 27, 10, 49, 45, 436, DateTimeKind.Utc).AddTicks(1231), "Green" });

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "HexColor" },
                values: new object[] { new DateTime(2026, 4, 27, 10, 49, 45, 436, DateTimeKind.Utc).AddTicks(1233), "Red" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedAt", "HexColor" },
                values: new object[] { new DateTime(2026, 4, 27, 10, 43, 43, 301, DateTimeKind.Utc).AddTicks(4605), null });

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "CreatedAt", "HexColor" },
                values: new object[] { new DateTime(2026, 4, 27, 10, 43, 43, 301, DateTimeKind.Utc).AddTicks(6072), null });

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "CreatedAt", "HexColor" },
                values: new object[] { new DateTime(2026, 4, 27, 10, 43, 43, 301, DateTimeKind.Utc).AddTicks(6074), null });

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "CreatedAt", "HexColor" },
                values: new object[] { new DateTime(2026, 4, 27, 10, 43, 43, 301, DateTimeKind.Utc).AddTicks(6076), null });
        }
    }
}
