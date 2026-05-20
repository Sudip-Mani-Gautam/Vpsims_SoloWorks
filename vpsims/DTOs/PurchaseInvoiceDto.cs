using System;

namespace vpsims.DTOs
{
    public class PurchaseInvoiceDto
    {
        public int Id { get; set; }
        public string VendorName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime PurchaseDate { get; set; }
        public int ItemsCount { get; set; }
    }
}
