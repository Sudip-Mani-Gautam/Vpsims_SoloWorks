using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace vpsims.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 10, 49, 45, 436, DateTimeKind.Utc).AddTicks(189));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 10, 49, 45, 436, DateTimeKind.Utc).AddTicks(1229));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 10, 49, 45, 436, DateTimeKind.Utc).AddTicks(1231));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 27, 10, 49, 45, 436, DateTimeKind.Utc).AddTicks(1233));
        }
    }
}
