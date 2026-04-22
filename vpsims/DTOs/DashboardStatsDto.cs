namespace vpsims.DTOs
{
    public class DashboardStatsDto
    {
        public decimal TotalRevenue { get; set; }
        public string RevenueTrend { get; set; } = string.Empty;
        public int TotalInventoryUnits { get; set; }
        public string InventoryTrend { get; set; } = string.Empty;
        public int ActivePersonnel { get; set; }
        public int CriticalShortages { get; set; }
        public string LowStockTrend { get; set; } = string.Empty;
        public int UnpaidInvoicesCount { get; set; }
        public decimal UnpaidInvoicesAmount { get; set; }
        public string UnpaidInvoicesTrend { get; set; } = string.Empty;
        public List<MonthlySalesDto> FinancialTrajectory { get; set; } = new();
        public List<SectorStatusDto> SectorStatus { get; set; } = new();
        public List<RecentActivityDto> RecentOperations { get; set; } = new();
        public List<LowStockItemDto> LowStockItems { get; set; } = new();
    }

    public class LowStockItemDto
    {
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
    }

    public class MonthlySalesDto
    {
        public string Month { get; set; } = string.Empty;
        public decimal Sales { get; set; }
        public decimal Profit { get; set; }
    }

    public class SectorStatusDto
    {
        public string Label { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int Val { get; set; }
    }

    public class RecentActivityDto
    {
        public string Text { get; set; } = string.Empty;
        public string Time { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
    }
}
