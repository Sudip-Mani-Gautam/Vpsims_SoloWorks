namespace vpsims.Models
{
    public class Part
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public decimal MarkedPrice { get; set; }
        public decimal SellingPrice { get; set; }
        public decimal CostPrice { get; set; }
        public int StockQuantity { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        // Inventory Details
        public string? Brand { get; set; }
        public string? CompatibleVehicleModel { get; set; }
        public int MinimumStockAlertLevel { get; set; } = 5;
        public string? RackLocation { get; set; }

        // Vendor Part Pricing Details
        public string MarginType { get; set; } = "Percentage"; // "Percentage" or "Fixed"
        public decimal MarginPercentage { get; set; }
        public decimal MarginAmount { get; set; }
        public int MinimumOrderQuantity { get; set; } = 1;
        public string? WarrantyPeriod { get; set; }
        public string? DeliveryTime { get; set; }
        public string? Notes { get; set; }

        public int CategoryId { get; set; }
        public Category? Category { get; set; }

        public int SupplierId { get; set; }
        public Supplier? Supplier { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
