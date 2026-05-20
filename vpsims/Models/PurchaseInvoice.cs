using System;
using System.Collections.Generic;

namespace vpsims.Models
{
    public class PurchaseInvoice
    {
        public int Id { get; set; }
        public int SupplierId { get; set; }
        public Supplier? Supplier { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending";
        public DateTime PurchaseDate { get; set; }
        public int ItemsCount { get; set; }

        public ICollection<PurchaseInvoiceItem> Items { get; set; } = new List<PurchaseInvoiceItem>();
    }
}
