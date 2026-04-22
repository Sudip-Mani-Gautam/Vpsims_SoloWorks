using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using vpsims.Data;

namespace vpsims.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users
                .Include(u => u.Vehicles)
                .Select(u => new {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Role,
                    u.IsActive,
                    u.CreatedAt,
                    Vehicles = u.Vehicles.Select(v => new { v.Make, v.Model, v.LicensePlate })
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("role/{role}")]
        public async Task<IActionResult> GetUsersByRole(string role)
        {
            var users = await _context.Users
                .Where(u => u.Role == role)
                .Select(u => new {
                    id = u.Id,
                    name = u.Name,
                    email = u.Email,
                    role = u.Role,
                    isActive = u.IsActive,
                    createdAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Status updated", isActive = user.IsActive });
        }

        [HttpGet("{id}/detail")]
        public async Task<IActionResult> GetCustomerDetail(int id)
        {
            var user = await _context.Users
                .Include(u => u.Vehicles)
                .Include(u => u.Orders)
                    .ThenInclude(o => o.OrderItems)
                        .ThenInclude(oi => oi.Part)
                .Include(u => u.PartRequests)
                .Include(u => u.Bookings)
                    .ThenInclude(b => b.Branch)
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null) return NotFound();

            // Calculate stats
            var totalSpent = user.Orders.Where(o => o.PaymentStatus == "Paid").Sum(o => o.TotalAmount);
            var pendingPayments = user.Orders.Where(o => o.PaymentStatus != "Paid").Sum(o => o.TotalAmount);

            return Ok(new {
                id = user.Id,
                name = user.Name,
                email = user.Email,
                phone = user.Phone ?? "N/A",
                address = user.Address ?? "N/A",
                role = user.Role,
                loyaltyPoints = user.LoyaltyPoints,
                createdAt = user.CreatedAt,
                totalSpent,
                pendingPayments,
                vehicles = user.Vehicles.Select(v => new {
                    v.Id,
                    v.Make,
                    v.Model,
                    v.Year,
                    v.LicensePlate
                }),
                orders = user.Orders.OrderByDescending(o => o.Id).Select(o => new {
                    o.Id,
                    o.TotalAmount,
                    o.Status,
                    o.PaymentStatus,
                    o.CreatedAt
                }),
                requests = user.PartRequests.OrderByDescending(r => r.Id).Select(r => new {
                    r.Id,
                    r.PartName,
                    r.Status,
                    r.CreatedAt
                }),
                bookings = user.Bookings.OrderByDescending(b => b.Id).Select(b => new {
                    b.Id,
                    ServiceType = b.ServiceNotes ?? "General Service",
                    b.ServiceDate,
                    b.Status,
                    BranchName = b.Branch?.Name ?? "Main"
                })
            });
        }

        [HttpGet("top-loyalty")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetTopLoyalty()
        {
            var topUsers = await _context.Users
                .Where(u => u.Role == "Customer")
                .OrderByDescending(u => u.LoyaltyPoints)
                .Take(10)
                .Select(u => new {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.LoyaltyPoints
                })
                .ToListAsync();
            return Ok(topUsers);
        }
    }
}
