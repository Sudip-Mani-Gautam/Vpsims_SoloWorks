using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using vpsims.Data;
using vpsims.DTOs.Auth;
using vpsims.Interfaces;
using vpsims.Models;

namespace vpsims.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly IActivityLogService _activityLogService;

        public AuthService(AppDbContext context, IConfiguration config, IActivityLogService activityLogService)
        {
            _context = context;
            _config = config;
            _activityLogService = activityLogService;
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
        {
            var normalizedEmail = dto.Email.Trim().ToLowerInvariant();

            if (await _context.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
                return null;

            var user = new User
            {
                Name = dto.Name,
                Email = normalizedEmail,
                Phone = dto.Phone,
                Branch = dto.Branch,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            if (user.Role == "Staff")
            {
                await _activityLogService.LogAsync(null, "STAFF_ADDED", $"New staff member '{user.Name}' ({user.Email}) registered in the system.");
            }

            // ── Auto-Registration of Vehicle (A-6, A-12) ───────────────────
            if (!string.IsNullOrEmpty(dto.VehicleMake) && !string.IsNullOrEmpty(dto.VehicleModel))
            {
                var vehicle = new Vehicle
                {
                    UserId = user.Id,
                    Make = dto.VehicleMake,
                    Model = dto.VehicleModel,
                    Year = dto.VehicleYear ?? DateTime.UtcNow.Year,
                    LicensePlate = dto.LicensePlate
                };
                _context.Vehicles.Add(vehicle);
                await _context.SaveChangesAsync();
            }

            return new AuthResponseDto
            {
                Token = GenerateToken(user),
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                UserId = user.Id
            };
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
        {
            var email = dto.Email.Trim();
            var normalizedEmail = email.ToLowerInvariant();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email)
                ?? await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return null;

            return new AuthResponseDto
            {
                Token = GenerateToken(user),
                Name = user.Name,
                Email = user.Email,
                Role = user.Role,
                UserId = user.Id
            };
        }

        private string GenerateToken(User user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Secret"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Name),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpiryMinutes"]!)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
