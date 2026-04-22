using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace vpsims.Migrations
{
    /// <inheritdoc />
    public partial class AddHexColorToFAQ : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RelatedId",
                table: "notifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "notifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HexColor",
                table: "faqs",
                type: "text",
                nullable: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RelatedId",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "notifications");

            migrationBuilder.DropColumn(
                name: "HexColor",
                table: "faqs");

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 9, 45, 51, 362, DateTimeKind.Utc).AddTicks(1873));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 9, 45, 51, 362, DateTimeKind.Utc).AddTicks(5427));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 9, 45, 51, 362, DateTimeKind.Utc).AddTicks(5563));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 9, 45, 51, 362, DateTimeKind.Utc).AddTicks(5566));
        }
    }
}
