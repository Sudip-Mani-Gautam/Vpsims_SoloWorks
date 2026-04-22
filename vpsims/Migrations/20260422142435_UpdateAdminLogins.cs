using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace vpsims.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAdminLogins : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "admin1@gmail.com", "$2a$11$gkTiMazXgyVznv1jTAKbgemylmSgS8JoPufrwhfjfet5yeU7GKRwu" });

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "admin2@gmail.com", "$2a$11$gkTiMazXgyVznv1jTAKbgemylmSgS8JoPufrwhfjfet5yeU7GKRwu" });

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "admin3@gmail.com", "$2a$11$gkTiMazXgyVznv1jTAKbgemylmSgS8JoPufrwhfjfet5yeU7GKRwu" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "admin1@vpsims.com", "$2a$11$p1jyj6f/GFzE7BIoP76kpOwj1ZcJlvN7pc5pdp3yA7fuhL.WhjveO" });

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "admin2@vpsims.com", "$2a$11$p1jyj6f/GFzE7BIoP76kpOwj1ZcJlvN7pc5pdp3yA7fuhL.WhjveO" });

            migrationBuilder.UpdateData(
                table: "users",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "Email", "PasswordHash" },
                values: new object[] { "admin3@vpsims.com", "$2a$11$p1jyj6f/GFzE7BIoP76kpOwj1ZcJlvN7pc5pdp3yA7fuhL.WhjveO" });
        }
    }
}
