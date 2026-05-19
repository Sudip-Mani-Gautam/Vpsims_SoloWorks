using Microsoft.EntityFrameworkCore;
using vpsims.Data;
using vpsims.DTOs;
using vpsims.Interfaces;
using vpsims.Models;

namespace vpsims.Services
{
    public class VehicleService : IVehicleService
    {
        private readonly AppDbContext _context;

        public VehicleService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<VehicleDto>> GetAllAsync(int? userId = null)
        {
            var query = _context.Vehicles.Include(v => v.User).AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(v => v.UserId == userId.Value);
            }

            var vehicles = await query.ToListAsync();
            return vehicles.Select(MapToDto);
        }

        public async Task<VehicleDto?> GetByIdAsync(int id)
        {
            var vehicle = await _context.Vehicles.Include(v => v.User).FirstOrDefaultAsync(v => v.Id == id);
            return vehicle == null ? null : MapToDto(vehicle);
        }

        public async Task<VehicleDto?> CreateAsync(CreateVehicleDto dto, string userRole, int currentUserId)
        {
            // Customers can only create vehicles for themselves
            if (userRole == "Customer" && dto.UserId != currentUserId)
            {
                dto.UserId = currentUserId; // Override to self
            }

            // Verify User exists
            if (!await _context.Users.AnyAsync(u => u.Id == dto.UserId))
                return null;

            var vehicle = new Vehicle
            {
                UserId = dto.UserId,
                Make = dto.Make,
                Model = dto.Model,
                Year = dto.Year,
                LicensePlate = dto.LicensePlate,
                VIN = dto.VIN
            };

            _context.Vehicles.Add(vehicle);
            await _context.SaveChangesAsync();

            // Load user for DTO mapping
            vehicle.User = await _context.Users.FirstAsync(u => u.Id == dto.UserId);

            return MapToDto(vehicle);
        }

        public async Task<VehicleDto?> UpdateAsync(int id, CreateVehicleDto dto, string userRole, int currentUserId)
        {
            var vehicle = await _context.Vehicles.Include(v => v.User).FirstOrDefaultAsync(v => v.Id == id);
            if (vehicle == null) return null;

            // Security check
            if (userRole == "Customer" && vehicle.UserId != currentUserId) return null;

            vehicle.Make = dto.Make;
            vehicle.Model = dto.Model;
            vehicle.Year = dto.Year;
            vehicle.LicensePlate = dto.LicensePlate;
            vehicle.VIN = dto.VIN;

            await _context.SaveChangesAsync();
            return MapToDto(vehicle);
        }

        public async Task<VehicleDto?> UpdateStatusAsync(int id, string status, string userRole, int currentUserId)
        {
            var vehicle = await _context.Vehicles.Include(v => v.User).FirstOrDefaultAsync(v => v.Id == id);
            if (vehicle == null) return null;

            // Customers can only change their own vehicles
            if (userRole == "Customer" && vehicle.UserId != currentUserId) return null;

            if (!Enum.TryParse<VehicleStatus>(status, true, out var parsedStatus))
                return null;

            vehicle.Status = parsedStatus;
            await _context.SaveChangesAsync();
            return MapToDto(vehicle);
        }

        public async Task<bool> DeleteAsync(int id, string userRole, int currentUserId)
        {
            var vehicle = await _context.Vehicles.FindAsync(id);
            if (vehicle == null) return false;

            // Security check
            if (userRole == "Customer" && vehicle.UserId != currentUserId) return false;

            _context.Vehicles.Remove(vehicle);
            await _context.SaveChangesAsync();
            return true;
        }

        private static VehicleDto MapToDto(Vehicle vehicle)
        {
            return new VehicleDto
            {
                Id = vehicle.Id,
                UserId = vehicle.UserId,
                CustomerName = vehicle.User?.Name ?? "Unknown",
                Make = vehicle.Make,
                Model = vehicle.Model,
                Year = vehicle.Year,
                LicensePlate = vehicle.LicensePlate,
                VIN = vehicle.VIN,
                Status = vehicle.Status.ToString()
            };
        }
    }
}
