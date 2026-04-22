using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace vpsims.Migrations
{
    /// <inheritdoc />
    public partial class FixSeedingAndSync : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "Id", "CreatedAt", "Email", "IsActive", "Name", "PasswordHash", "Role" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin1@vpsims.com", true, "Nexus Command Alpha", "$2a$11$Kpkb9O.B4X5e.M4vQ/O8Lu.1r7V.v7u9v0/V87/7vVvVvVvVvVvV", "Admin" },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin2@vpsims.com", true, "Nexus Command Beta", "$2a$11$Kpkb9O.B4X5e.M4vQ/O8Lu.1r7V.v7u9v0/V87/7vVvVvVvVvVvV", "Admin" },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin3@vpsims.com", true, "Nexus Command Gamma", "$2a$11$Kpkb9O.B4X5e.M4vQ/O8Lu.1r7V.v7u9v0/V87/7vVvVvVvVvVvV", "Admin" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "Id",
                keyValue: 3);
        }
    }
}
