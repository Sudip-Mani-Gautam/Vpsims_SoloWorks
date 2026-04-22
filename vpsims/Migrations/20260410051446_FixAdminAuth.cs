using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace vpsims.Migrations
{
    /// <inheritdoc />
    public partial class FixAdminAuth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$p1jyj6f/GFzE7BIoP76kpOwj1ZcJlvN7pc5pdp3yA7fuhL.WhjveO");

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$p1jyj6f/GFzE7BIoP76kpOwj1ZcJlvN7pc5pdp3yA7fuhL.WhjveO");

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$p1jyj6f/GFzE7BIoP76kpOwj1ZcJlvN7pc5pdp3yA7fuhL.WhjveO");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 1,
                column: "PasswordHash",
                value: "$2a$11$Kpkb9O.B4X5e.M4vQ/O8Lu.1r7V.v7u9v0/V87/7vVvVvVvVvVvV");

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 2,
                column: "PasswordHash",
                value: "$2a$11$Kpkb9O.B4X5e.M4vQ/O8Lu.1r7V.v7u9v0/V87/7vVvVvVvVvVvV");

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 3,
                column: "PasswordHash",
                value: "$2a$11$Kpkb9O.B4X5e.M4vQ/O8Lu.1r7V.v7u9v0/V87/7vVvVvVvVvVvV");
        }
    }
}
