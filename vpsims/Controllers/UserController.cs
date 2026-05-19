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
                    u.Phone,
                    u.LoyaltyPoints,
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
        public async Task<IActionResult> GetTopLoyalty([FromQuery] string period = "all")
        {
            var now = DateTime.UtcNow;
            DateTime? from = period switch {
                "quarterly"  => now.AddMonths(-3),
                "half-year"  => now.AddMonths(-6),
                "yearly"     => now.AddMonths(-12),
                _            => (DateTime?)null
            };

            if (from == null)
            {
                // All-time: use cumulative LoyaltyPoints
                var topUsers = await _context.Users
                    .Where(u => u.Role == "Customer")
                    .OrderByDescending(u => u.LoyaltyPoints)
                    .Take(10)
                    .Select(u => new {
                        id           = u.Id,
                        name         = u.Name,
                        email        = u.Email,
                        loyaltyPoints= u.LoyaltyPoints
                    })
                    .ToListAsync();
                return Ok(topUsers);
            }
            else
            {
                // Period-based: sum order amounts paid within the window as a proxy for earned points
                var periodPoints = await _context.Users
                    .Where(u => u.Role == "Customer")
                    .Select(u => new {
                        id    = u.Id,
                        name  = u.Name,
                        email = u.Email,
                        loyaltyPoints = (int)u.Orders
                            .Where(o => o.PaymentStatus == "Paid" && o.CreatedAt >= from)
                            .Sum(o => (double)o.TotalAmount / 100) // 1 point per NPR 100
                    })
                    .OrderByDescending(u => u.loyaltyPoints)
                    .Take(10)
                    .ToListAsync();
                return Ok(periodPoints);
            }
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserUpdateDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.Name = dto.Name ?? user.Name;
            user.Email = dto.Email ?? user.Email;
            user.Phone = dto.Phone ?? user.Phone;
            user.Role = dto.Role ?? user.Role;
            // Note: We don't update branch here if it's not in the model, 
            // but the User model doesn't have a Branch property. 
            // If branch is needed, it might be a custom field or another table.
            // For now, let's just update the core fields.

            await _context.SaveChangesAsync();
            return Ok(new { message = "User updated successfully" });
        }

        [HttpPatch("{id}/password")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangePassword(int id, [FromBody] PasswordUpdateDto dto)
        {
            if (string.IsNullOrEmpty(dto.Password) || dto.Password.Length < 6)
                return BadRequest(new { message = "Password must be at least 6 characters" });

            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Password updated successfully" });
        }
    }

    public class UserUpdateDto {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Role { get; set; }
        public string? Branch { get; set; }
    }

    public class PasswordUpdateDto {
        public string Password { get; set; } = string.Empty;
    }
}
