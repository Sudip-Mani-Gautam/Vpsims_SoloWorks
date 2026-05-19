using Microsoft.AspNetCore.Mvc;
using vpsims.DTOs.Auth;
using vpsims.Interfaces;

namespace vpsims.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var currentUserRole = User.Identity?.IsAuthenticated == true 
                ? User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value 
                : null;

            // 1. Administrators are limited to the 2 seeded accounts.
            if (dto.Role == "Admin")
                return BadRequest(new { message = "Cannot register new Admin users. System is restricted to 2 administrators only." });

            // 2. Staff cannot self-register. Only Admins can register Staff.
            if (dto.Role == "Staff")
            {
                if (currentUserRole != "Admin")
                    return Forbid("Staff accounts must be created by an Administrator. Self-registration for Staff is prohibited.");
            }

            // 3. Default any unspecified roles to Customer
            if (string.IsNullOrEmpty(dto.Role)) dto.Role = "Customer";

            // 4. If an unauthenticated user or non-admin tries to register as something other than Customer
            if (dto.Role != "Customer" && currentUserRole != "Admin")
            {
                return Forbid("Only Administrators can register accounts with elevated privileges.");
            }

            if (dto.Role != "Customer" && dto.Role != "Staff")
                return BadRequest(new { message = "Invalid role specified." });

            var result = await _authService.RegisterAsync(dto);
            if (result == null)
                return BadRequest(new { message = "Email already exists." });

            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);
            if (result == null)
                return Unauthorized(new { message = "Invalid email or password." });

            return Ok(result);
        }
    }
}
