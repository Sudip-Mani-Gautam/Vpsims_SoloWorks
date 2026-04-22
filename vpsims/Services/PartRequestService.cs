using Microsoft.EntityFrameworkCore;
using vpsims.Data;
using vpsims.DTOs.PartRequest;
using vpsims.Interfaces;
using vpsims.Models;

namespace vpsims.Services
{
    public class PartRequestService : IPartRequestService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notificationService;

        public PartRequestService(AppDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        private static PartRequestDto ToDto(PartRequest r) => new()
        {
            Id = r.Id,
            UserId = r.UserId,
            UserName = r.User?.Name ?? "Unknown",
            PartName = r.PartName,
            PartNumber = r.PartNumber,
            VehicleModel = r.VehicleModel,
            Quantity = r.Quantity,
            Priority = r.Priority,
            Description = r.Description,
            Status = r.Status,
            CreatedAt = r.CreatedAt
        };

        public async Task<IEnumerable<PartRequestDto>> GetAllAsync() =>
            (await _context.PartRequests.Include(r => r.User).OrderByDescending(r => r.CreatedAt).ToListAsync()).Select(ToDto);

        public async Task<IEnumerable<PartRequestDto>> GetByUserAsync(int userId) =>
            (await _context.PartRequests.Include(r => r.User).Where(r => r.UserId == userId).OrderByDescending(r => r.CreatedAt).ToListAsync()).Select(ToDto);

        public async Task<PartRequestDto> CreateAsync(int userId, CreatePartRequestDto dto)
        {
            var request = new PartRequest
            {
                UserId = userId,
                PartName = dto.PartName,
                PartNumber = dto.PartNumber,
                VehicleModel = dto.VehicleModel,
                Quantity = dto.Quantity,
                Priority = dto.Priority,
                Description = dto.Description,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.PartRequests.Add(request);
            await _context.SaveChangesAsync();

            var full = await _context.PartRequests.Include(r => r.User).FirstAsync(r => r.Id == request.Id);
            return ToDto(full);
        }

        public async Task<PartRequestDto?> UpdateStatusAsync(int id, UpdatePartRequestStatusDto dto)
        {
            var request = await _context.PartRequests.Include(r => r.User).FirstOrDefaultAsync(r => r.Id == id);
            if (request == null) return null;

            request.Status = dto.Status;
            await _context.SaveChangesAsync();

            // Notify User
            await _notificationService.CreateNotificationAsync(
                request.UserId,
                "Part Request Update",
                $"Your request for '{request.PartName}' is now marked as: {dto.Status}.",
                "PART_REQUEST_UPDATE",
                request.Id.ToString()
            );

            return ToDto(request);
        }

        public async Task<bool> CancelAsync(int id, int userId)
        {
            var request = await _context.PartRequests.FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);
            if (request == null) return false;

            request.Status = "Cancelled";
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var request = await _context.PartRequests.FindAsync(id);
            if (request == null) return false;

            _context.PartRequests.Remove(request);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
