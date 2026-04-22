using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace vpsims.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminSeeding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "Id",
                keyValue: 3);

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

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "VPSIMS ADMIN Alpha");

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "VPSIMS Hub");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 1,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 24, 15, 54, 58, 3, DateTimeKind.Utc).AddTicks(2709));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 2,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 24, 15, 54, 58, 3, DateTimeKind.Utc).AddTicks(3542));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 3,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 24, 15, 54, 58, 3, DateTimeKind.Utc).AddTicks(3544));

            migrationBuilder.UpdateData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 4,
                column: "CreatedAt",
                value: new DateTime(2026, 4, 24, 15, 54, 58, 3, DateTimeKind.Utc).AddTicks(3545));

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "VPSIMS Hub Alpha");

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "VPSIMS Hub Beta");

            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "Id", "Address", "CreatedAt", "Email", "IsActive", "LoyaltyPoints", "Name", "PasswordHash", "Phone", "Role" },
                values: new object[] { 3, null, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin3@gmail.com", true, 0, "VPSIMS Hub Gamma", "$2a$11$gkTiMazXgyVznv1jTAKbgemylmSgS8JoPufrwhfjfet5yeU7GKRwu", null, "Admin" });
        }
    }
}
