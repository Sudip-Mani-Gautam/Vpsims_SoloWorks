using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace vpsims.Migrations
{
    /// <inheritdoc />
    public partial class RebrandingToVPSIMS : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "Name" },
                values: new object[] { "admin1@vpsims.com", "VPSIMS Hub Alpha" });

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Email", "Name" },
                values: new object[] { "admin2@vpsims.com", "VPSIMS Hub Beta" });

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Email", "Name" },
                values: new object[] { "admin3@vpsims.com", "VPSIMS Hub Gamma" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 1,
                column: "Name",
                value: "Nexus Command Alpha");

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 2,
                column: "Name",
                value: "Nexus Command Beta");

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 3,
                column: "Name",
                value: "Nexus Command Gamma");
        }
    }
}
