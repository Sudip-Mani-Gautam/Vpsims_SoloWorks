using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using vpsims.Data;

namespace vpsims.Controllers
{
    [ApiController]
    [Route("api/debug")]
    public class DebugController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DebugController(AppDbContext context)
        {
            _context = context;
        }

        // Dev-only: list unpaid orders with user info
        [HttpGet("unpaid-orders")]
        public async Task<IActionResult> UnpaidOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .Where(o => o.PaymentStatus != "Paid")
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new {
                    o.Id,
                    o.UserId,
                    UserName = o.User != null ? o.User.Name : o.GuestName,
                    o.TotalAmount,
                    o.AmountPaid,
                    o.PaymentStatus,
                    Items = o.OrderItems.Select(i => new { i.PartId, i.Quantity, i.UnitPrice })
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("orders-for/{userId}")]
        public async Task<IActionResult> OrdersFor(int userId)
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new {
                    o.Id,
                    o.UserId,
                    o.TotalAmount,
                    o.AmountPaid,
                    o.PaymentStatus
                })
                .ToListAsync();

            return Ok(orders);
        }

        // Dev: decode a JWT (no validation) from query string and return the claims + userId
        [HttpGet("whoami")]
        public IActionResult WhoAmI([FromQuery] string? token)
        {
            // If token provided via query, decode it; otherwise use current HttpContext.User
            if (!string.IsNullOrEmpty(token))
            {
                try
                {
                    var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                    var jwt = handler.ReadJwtToken(token);
                    var claims = jwt.Claims.ToDictionary(c => c.Type, c => c.Value);
                    claims.TryGetValue(System.Security.Claims.ClaimTypes.NameIdentifier, out var nameId);
                    return Ok(new { authenticated = true, from = "token", claims, userId = nameId });
                }
                catch (Exception ex)
                {
                    return BadRequest(new { error = "Invalid token", detail = ex.Message });
                }
            }

            var user = HttpContext.User;
            if (user?.Identity != null && user.Identity.IsAuthenticated)
            {
                var claims = user.Claims.ToDictionary(c => c.Type, c => c.Value);
                var id = user.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                return Ok(new { authenticated = true, from = "context", claims, userId = id });
            }

            return Ok(new { authenticated = false });
        }

        // Dev: accept token via query, decode and return orders for that user id
        [HttpGet("orders-for-token")]
        public async Task<IActionResult> OrdersForToken([FromQuery] string token)
        {
            if (string.IsNullOrEmpty(token)) return BadRequest(new { error = "token required" });
            try
            {
                var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var jwt = handler.ReadJwtToken(token);
                var nameId = jwt.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                          ?? jwt.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;

                if (string.IsNullOrEmpty(nameId)) return BadRequest(new { error = "user id claim not found in token" });

                if (!int.TryParse(nameId, out var userId)) return BadRequest(new { error = "invalid user id in token" });

                var orders = await _context.Orders
                    .Include(o => o.OrderItems)
                    .Where(o => o.UserId == userId)
                    .OrderByDescending(o => o.CreatedAt)
                    .Select(o => new { o.Id, o.UserId, o.TotalAmount, o.AmountPaid, o.PaymentStatus })
                    .ToListAsync();

                return Ok(new { userId, orders });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "invalid token", detail = ex.Message });
            }
        }
    }
}
