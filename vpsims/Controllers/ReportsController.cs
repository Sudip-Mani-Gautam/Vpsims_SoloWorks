using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using vpsims.Data;

namespace vpsims.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Staff")]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("revenue-stats")]
        public async Task<IActionResult> GetRevenueStats()
        {
            var now = DateTime.UtcNow;

            var todayStart = now.Date;
            var todayEnd   = todayStart.AddDays(1);

            var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var monthEnd   = monthStart.AddMonths(1);

            var yearStart  = new DateTime(now.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var yearEnd    = yearStart.AddYears(1);

            var daily = await _context.Orders
                .Where(o => o.CreatedAt >= todayStart && o.CreatedAt < todayEnd)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            var monthly = await _context.Orders
                .Where(o => o.CreatedAt >= monthStart && o.CreatedAt < monthEnd)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            var yearly = await _context.Orders
                .Where(o => o.CreatedAt >= yearStart && o.CreatedAt < yearEnd)
                .SumAsync(o => (decimal?)o.TotalAmount) ?? 0;

            return Ok(new { daily, monthly, yearly });
        }

        [HttpGet("top-spenders")]
        public async Task<IActionResult> GetTopSpenders()
        {
            var spenders = await _context.Orders
                .Include(o => o.User)
                .GroupBy(o => new { o.UserId, o.User.Name })
                .Select(g => new
                {
                    Name = g.Key.Name,
                    Spent = g.Sum(o => o.TotalAmount),
                    Purchases = g.Count()
                })
                .OrderByDescending(s => s.Spent)
                .Take(5)
                .ToListAsync();

            return Ok(spenders);
        }

        [HttpGet("overdue-credits")]
        public async Task<IActionResult> GetOverdueCredits()
        {
            var threshold = DateTime.UtcNow.AddMonths(-1);
            
            var overdue = await _context.Orders
                .Include(o => o.User)
                .Where(o => o.PaymentStatus != "Paid" && o.DueDate < threshold)
                .OrderBy(o => o.DueDate)
                .Select(o => new
                {
                    Name = o.User.Name,
                    Amount = o.TotalAmount - o.AmountPaid,
                    DaysPast = (DateTime.UtcNow - (o.DueDate ?? o.CreatedAt)).Days,
                    InvoiceId = o.Id
                })
                .ToListAsync();

            return Ok(overdue);
        }

        [HttpGet("low-stock")]
        public async Task<IActionResult> GetLowStock()
        {
            var lowStock = await _context.Parts
                .Where(p => p.StockQuantity < 10)
                .Select(p => new
                {
                    p.Name,
                    p.StockQuantity,
                    p.MarkedPrice
                })
                .ToListAsync();
            
            return Ok(lowStock);
        }
    }
}
