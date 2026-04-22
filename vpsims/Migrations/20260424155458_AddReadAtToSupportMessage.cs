using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace vpsims.Migrations
{
    /// <inheritdoc />
    public partial class AddReadAtToSupportMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ReadAt",
                table: "support_messages",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.InsertData(
                table: "faqs",
                columns: new[] { "Id", "Answer", "Category", "CreatedAt", "DisplayOrder", "IsPublished", "Question" },
                values: new object[,]
                {
                    { 1, "Navigate to the 'Book Appointment' section from your dashboard, select your vehicle, choose a service type and date, and submit. You will receive a notification once our staff approves it.", "Bookings", new DateTime(2026, 4, 24, 15, 54, 58, 3, DateTimeKind.Utc).AddTicks(2709), 1, true, "How do I create a service appointment?" },
                    { 2, "For every purchase and service completed, you earn loyalty points. These points can be redeemed for discounts on future parts or services. You can view your balance in your profile.", "Rewards", new DateTime(2026, 4, 24, 15, 54, 58, 3, DateTimeKind.Utc).AddTicks(3542), 2, true, "What is the 'Loyalty Points' system?" },
                    { 3, "Use the 'Request Parts' feature. Provide the part name, description, and your vehicle details. Our procurement team will find it for you and provide a quote.", "Parts", new DateTime(2026, 4, 24, 15, 54, 58, 3, DateTimeKind.Utc).AddTicks(3544), 3, true, "How can I request a part that is not in stock?" },
                    { 4, "Yes, all our genuine parts come with a manufacturer's warranty. The duration depends on the specific part and brand. Please keep your invoice for any warranty claims.", "Policies", new DateTime(2026, 4, 24, 15, 54, 58, 3, DateTimeKind.Utc).AddTicks(3545), 4, true, "Is there a warranty on the parts purchased?" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "faqs",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DropColumn(
                name: "ReadAt",
                table: "support_messages");
        }
    }
}
