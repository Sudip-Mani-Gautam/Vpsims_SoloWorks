using Microsoft.AspNetCore.Http;

namespace vpsims.DTOs.Part
{
    public class PartDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public decimal MarkedPrice { get; set; }
        public decimal SellingPrice { get; set; }
        public decimal CostPrice { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        
        public string? Brand { get; set; }
        public string? CompatibleVehicleModel { get; set; }
        public int MinimumStockAlertLevel { get; set; }
        public string? RackLocation { get; set; }
        
        public string MarginType { get; set; } = "Percentage";
        public decimal MarginPercentage { get; set; }
        public decimal MarginAmount { get; set; }
        public int MinimumOrderQuantity { get; set; }
        public string? WarrantyPeriod { get; set; }
        public string? DeliveryTime { get; set; }
        public string? Notes { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int SupplierId { get; set; }
        public string SupplierName { get; set; } = string.Empty;
    }

    public class CreatePartDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public decimal MarkedPrice { get; set; }
        public decimal SellingPrice { get; set; }
        public decimal CostPrice { get; set; }
        public int StockQuantity { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        
        public string? Brand { get; set; }
        public string? CompatibleVehicleModel { get; set; }
        public int MinimumStockAlertLevel { get; set; } = 5;
        public string? RackLocation { get; set; }
        
        public string MarginType { get; set; } = "Percentage";
        public decimal MarginPercentage { get; set; }
        public decimal MarginAmount { get; set; }
        public int MinimumOrderQuantity { get; set; } = 1;
        public string? WarrantyPeriod { get; set; }
        public string? DeliveryTime { get; set; }
        public string? Notes { get; set; }
        public int CategoryId { get; set; }
        public int SupplierId { get; set; }
        public IFormFile? ImageFile { get; set; }
    }

    public class UpdatePartDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public decimal MarkedPrice { get; set; }
        public decimal SellingPrice { get; set; }
        public decimal CostPrice { get; set; }
        public int StockQuantity { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        
        public string? Brand { get; set; }
        public string? CompatibleVehicleModel { get; set; }
        public int MinimumStockAlertLevel { get; set; } = 5;
        public string? RackLocation { get; set; }
        
        public string MarginType { get; set; } = "Percentage";
        public decimal MarginPercentage { get; set; }
        public decimal MarginAmount { get; set; }
        public int MinimumOrderQuantity { get; set; } = 1;
        public string? WarrantyPeriod { get; set; }
        public string? DeliveryTime { get; set; }
        public string? Notes { get; set; }
        public int CategoryId { get; set; }
        public int SupplierId { get; set; }
        public IFormFile? ImageFile { get; set; }
    }
}
