using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using vpsims.Interfaces;
using vpsims.Models;

namespace vpsims.Services
{
    public class PdfService : IPdfService
    {
        public byte[] GenerateInvoicePdf(Order order)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(1, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.Verdana));

                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("VPSIMS").FontSize(24).FontFamily(Fonts.Verdana).SemiBold().FontColor(Colors.Blue.Medium);
                            col.Item().Text("Main Distribution Hub").FontSize(10).Italic();
                        });

                        row.RelativeItem().AlignRight().Column(col =>
                        {
                            col.Item().Text($"INVOICE: INV-{order.Id:D6}").FontSize(14).SemiBold();
                            col.Item().Text($"Date: {order.CreatedAt:dd MMM yyyy}");
                            col.Item().Text($"Status: {order.PaymentStatus.ToUpper()}").FontColor(order.PaymentStatus == "Paid" ? Colors.Green.Medium : Colors.Red.Medium);
                        });
                    });

                    page.Content().PaddingVertical(20).Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("BILL TO:").SemiBold().FontColor(Colors.Grey.Medium);
                                c.Item().Text(order.User?.Name ?? "Guest Customer").FontSize(12).SemiBold();
                                c.Item().Text(order.User?.Email ?? "N/A");
                            });
                        });

                        col.Item().PaddingTop(20).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3);
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(CellStyle).Text("Part / Component").FontSize(11).SemiBold();
                                header.Cell().Element(CellStyle).AlignRight().Text("Qty").FontSize(11).SemiBold();
                                header.Cell().Element(CellStyle).AlignRight().Text("Unit").FontSize(11).SemiBold();
                                header.Cell().Element(CellStyle).AlignRight().Text("Total").FontSize(11).SemiBold();

                                static IContainer CellStyle(IContainer container) => container.PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                            });

                            foreach (var item in order.OrderItems)
                            {
                                table.Cell().Element(ItemStyle).Text(item.Part?.Name ?? "Component");
                                table.Cell().Element(ItemStyle).AlignRight().Text(item.Quantity.ToString());
                                table.Cell().Element(ItemStyle).AlignRight().Text($"NPR {item.UnitPrice:N2}");
                                table.Cell().Element(ItemStyle).AlignRight().Text($"NPR {item.Quantity * item.UnitPrice:N2}");

                                static IContainer ItemStyle(IContainer container) => container.PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten3);
                            }
                        });

                        col.Item().AlignRight().PaddingTop(10).Column(c =>
                        {
                            c.Item().Text($"Grand Total: NPR {order.TotalAmount:N2}").FontSize(14).SemiBold().FontColor(Colors.Blue.Medium);
                            c.Item().Text($"Amount Paid: NPR {order.AmountPaid:N2}").FontSize(10);
                            if (order.TotalAmount > order.AmountPaid)
                            {
                                c.Item().Text($"Balanced Due: NPR {order.TotalAmount - order.AmountPaid:N2}").FontColor(Colors.Red.Medium).Bold();
                            }
                        });
                    });

                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                        x.Span(" of ");
                        x.TotalPages();
                    });
                });
            });

            return document.GeneratePdf();
        }

        public byte[] GeneratePurchaseInvoicePdf(vpsims.Models.PurchaseInvoice invoice)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(1, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.Verdana));

                    page.Header().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("VPSIMS - Purchase Invoice").FontSize(20).FontFamily(Fonts.Verdana).SemiBold().FontColor(Colors.Blue.Medium);
                            col.Item().Text(invoice.Supplier?.Name ?? "Supplier").FontSize(12);
                        });

                        row.RelativeItem().AlignRight().Column(col =>
                        {
                            col.Item().Text($"PURCHASE: PUR-{invoice.Id:D6}").FontSize(12).SemiBold();
                            col.Item().Text($"Date: {invoice.PurchaseDate:dd MMM yyyy}");
                            col.Item().Text($"Status: {invoice.Status}").FontColor(invoice.Status == "Completed" ? Colors.Green.Medium : Colors.Red.Medium);
                        });
                    });

                    page.Content().PaddingVertical(20).Column(col =>
                    {
                        col.Item().PaddingTop(10).Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(4);
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(CellStyle).Text("Item").FontSize(11).SemiBold();
                                header.Cell().Element(CellStyle).AlignRight().Text("Qty").FontSize(11).SemiBold();
                                header.Cell().Element(CellStyle).AlignRight().Text("Unit Price").FontSize(11).SemiBold();

                                static IContainer CellStyle(IContainer container) => container.PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                            });

                            foreach (var item in invoice.Items)
                            {
                                table.Cell().Element(ItemStyle).Text(item.PartName ?? "Item");
                                table.Cell().Element(ItemStyle).AlignRight().Text(item.Quantity.ToString());
                                table.Cell().Element(ItemStyle).AlignRight().Text($"NPR {item.UnitPrice:N2}");

                                static IContainer ItemStyle(IContainer container) => container.PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Grey.Lighten3);
                            }
                        });

                        col.Item().AlignRight().PaddingTop(10).Column(c =>
                        {
                            c.Item().Text($"Grand Total: NPR {invoice.TotalAmount:N2}").FontSize(14).SemiBold().FontColor(Colors.Blue.Medium);
                        });
                    });

                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("Page ");
                        x.CurrentPageNumber();
                        x.Span(" of ");
                        x.TotalPages();
                    });
                });
            });

            return document.GeneratePdf();
        }
    }
}
