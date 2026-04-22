using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using vpsims.Data;
using vpsims.DTOs;

namespace vpsims.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("admin-stats")]
        public async Task<IActionResult> GetAdminStats()
        {
            // Real stats from DB
            var totalRevenue = await _context.Orders.SumAsync(o => o.TotalAmount);
            var inventoryUnits = await _context.Parts.SumAsync(p => p.StockQuantity);
            var activePersonnel = await _context.Users.CountAsync(u => u.Role == "Staff" || u.Role == "Admin");
            var criticalShortages = await _context.Parts.CountAsync(p => p.StockQuantity < 10);

            // Mocking historical data for charts as the system is new
            var financialTrajectory = new List<MonthlySalesDto>
            {
                new() { Month = "Jan", Sales = 4200, Profit = 1200 },
                new() { Month = "Feb", Sales = 5800, Profit = 1800 },
                new() { Month = "Mar", Sales = 6100, Profit = 2100 },
                new() { Month = "Apr", Sales = 4900, Profit = 1400 },
                new() { Month = "May", Sales = 7200, Profit = 2400 },
                new() { Month = "Jun", Sales = totalRevenue > 0 ? totalRevenue : 8500, Profit = totalRevenue * 0.3m }
            };

            var sectorStatus = new List<SectorStatusDto>
            {
                new() { Label = "Warehouse A", Status = "Optimal", Val = 92 },
                new() { Label = "Sales Terminal", Status = "High Activity", Val = 78 },
                new() { Label = "Procurement", Status = criticalShortages > 5 ? "Bottleneck" : "Optimal", Val = criticalShortages > 5 ? 45 : 90 }
            };

            var recentActivity = await _context.ActivityLogs
                .OrderByDescending(a => a.Timestamp)
                .Take(4)
                .Select(a => new RecentActivityDto
                {
                    Text = a.Action,
                    Time = GetTimeAgo(a.Timestamp),
                    Type = a.Action.ToLower().Contains("invoice") ? "financial" : "operation"
                })
                .ToListAsync();

            if (recentActivity.Count == 0)
            {
                recentActivity = new List<RecentActivityDto>
                {
                    new() { Text = "System initialized by VPSIMS", Time = "Just now", Type = "system" },
                    new() { Text = "Administrator database established", Time = "10 mins ago", Type = "system" },
                };
            }

            var lowStockItems = await _context.Parts
                .Where(p => p.StockQuantity < 10)
                .OrderBy(p => p.StockQuantity)
                .Take(5)
                .Select(p => new LowStockItemDto
                {
                    Name = p.Name,
                    SKU = p.SKU,
                    StockQuantity = p.StockQuantity
                })
                .ToListAsync();

            var unpaidOrders = await _context.Orders
                .Where(o => o.PaymentStatus != "Paid")
                .ToListAsync();
            var unpaidCount = unpaidOrders.Count;
            var unpaidAmount = unpaidOrders.Sum(o => o.TotalAmount);

            // Real monthly financial trajectory (last 6 months)
            var now = DateTime.UtcNow;
            var trajectory = new List<MonthlySalesDto>();
            for (int i = 5; i >= 0; i--)
            {
                var month = now.AddMonths(-i);
                var start = new DateTime(month.Year, month.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                var end = start.AddMonths(1);
                var monthlySales = await _context.Orders
                    .Where(o => o.CreatedAt >= start && o.CreatedAt < end && o.PaymentStatus == "Paid")
                    .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;
                trajectory.Add(new MonthlySalesDto
                {
                    Month = month.ToString("MMM"),
                    Sales = monthlySales,
                    Profit = monthlySales * 0.3m
                });
            }

            return Ok(new DashboardStatsDto
            {
                TotalRevenue = totalRevenue,
                RevenueTrend = $"NPR {totalRevenue:N0} total collected",
                TotalInventoryUnits = inventoryUnits,
                InventoryTrend = $"{inventoryUnits} units in stock",
                ActivePersonnel = activePersonnel,
                CriticalShortages = criticalShortages,
                LowStockTrend = criticalShortages > 0 ? $"{criticalShortages} items need restocking" : "All stock healthy",
                UnpaidInvoicesCount = unpaidCount,
                UnpaidInvoicesAmount = unpaidAmount,
                UnpaidInvoicesTrend = unpaidAmount > 0 ? $"NPR {unpaidAmount:N0} due" : "All invoices paid",
                FinancialTrajectory = trajectory,
                SectorStatus = sectorStatus,
                RecentOperations = recentActivity,
                LowStockItems = lowStockItems
            });
        }

        private static string GetTimeAgo(DateTime dateTime)
        {
            var span = DateTime.UtcNow - dateTime;
            if (span.TotalMinutes < 1) return "Just now";
            if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes} min ago";
            if (span.TotalHours < 24) return $"{(int)span.TotalHours} hours ago";
            return $"{span.Days} days ago";
        }

        [HttpGet("customer-stats/{userId}")]
        public async Task<IActionResult> GetCustomerStats(int userId)
        {
            var totalPurchases = await _context.Orders.CountAsync(o => o.UserId == userId);
            var totalSpent = await _context.Orders
                .Where(o => o.UserId == userId && o.PaymentStatus == "Paid")
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;
            var appointmentsCount = await _context.Bookings
                .CountAsync(b => b.UserId == userId && (b.Status == "Pending" || b.Status == "Approved"));
            var reviewsCount = await _context.Reviews.CountAsync(r => r.UserId == userId);

            var upcomingBooking = await _context.Bookings
                .Include(b => b.Branch)
                .Include(b => b.Vehicle)
                .Where(b => b.UserId == userId && b.ServiceDate >= DateTime.UtcNow && (b.Status == "Pending" || b.Status == "Approved"))
                .OrderBy(b => b.ServiceDate)
                .Select(b => new {
                    b.Id,
                    ServiceType = b.ServiceNotes ?? "General Service Check",
                    ServiceDate = b.ServiceDate,
                    TimeSlot = b.TimeSlot,
                    BranchName = b.Branch.Name,
                    Vehicle = b.Vehicle != null ? $"{b.Vehicle.Make} {b.Vehicle.Model} {b.Vehicle.Year} ({b.Vehicle.LicensePlate})" : "N/A"
                })
                .FirstOrDefaultAsync();

            var recentNotifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(3)
                .Select(n => new {
                    n.Id,
                    n.Message,
                    n.IsRead,
                    Time = GetTimeAgo(n.CreatedAt)
                })
                .ToListAsync();

            return Ok(new {
                totalPurchases,
                totalSpent,
                appointmentsCount,
                reviewsCount,
                upcomingBooking,
                recentNotifications
            });
        }
    }
}
