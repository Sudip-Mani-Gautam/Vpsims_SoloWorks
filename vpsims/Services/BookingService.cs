using Microsoft.EntityFrameworkCore;
using vpsims.Data;
using vpsims.DTOs;
using vpsims.Interfaces;
using vpsims.Models;
using Hangfire;

namespace vpsims.Services
{
    public class BookingService : IBookingService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IBackgroundJobClient _backgroundJobClient;
        private const int MAX_USERS_PER_SLOT = 5;

        public BookingService(AppDbContext context, IEmailService emailService, IBackgroundJobClient backgroundJobClient)
        {
            _context = context;
            _emailService = emailService;
            _backgroundJobClient = backgroundJobClient;
        }

        public async Task<IEnumerable<BookingDto>> GetAllAsync(int? userId = null, int? branchId = null)
        {
            var query = _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Branch)
                .Include(b => b.Vehicle)
                .AsQueryable();

            if (userId.HasValue) query = query.Where(b => b.UserId == userId.Value);
            if (branchId.HasValue) query = query.Where(b => b.BranchId == branchId.Value);

            var bookings = await query.OrderByDescending(b => b.ServiceDate).ToListAsync();
            return bookings.Select(MapToDto);
        }

        public async Task<BookingDto?> GetByIdAsync(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Branch)
                .Include(b => b.Vehicle)
                .FirstOrDefaultAsync(b => b.Id == id);

            return booking == null ? null : MapToDto(booking);
        }

        public async Task<int> GetSlotAvailabilityAsync(int branchId, DateTime date, string timeSlot)
        {
            var utcDate = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
            var bookedCount = await _context.Bookings
                .CountAsync(b => b.BranchId == branchId && b.ServiceDate.Date == utcDate && b.TimeSlot == timeSlot && b.Status != "Rejected" && b.Status != "Cancelled");
            
            return Math.Max(0, MAX_USERS_PER_SLOT - bookedCount);
        }

        public async Task<BookingDto?> CreateAsync(CreateBookingDto dto, string userRole, int currentUserId)
        {
            if (userRole == "Customer" && dto.UserId != currentUserId)
            {
                dto.UserId = currentUserId; // Security override
            }

            // Verify branch exists
            if (!await _context.Branches.AnyAsync(b => b.Id == dto.BranchId)) return null;

            // Enforce max 5 users per slot limit
            var utcServiceDate = DateTime.SpecifyKind(dto.ServiceDate.Date, DateTimeKind.Utc);
            var availableSlots = await GetSlotAvailabilityAsync(dto.BranchId, utcServiceDate, dto.TimeSlot);
            if (availableSlots <= 0)
            {
                throw new Exception("This time slot is fully booked.");
            }

            var booking = new Booking
            {
                UserId = dto.UserId,
                BranchId = dto.BranchId,
                VehicleId = dto.VehicleId,
                ServiceDate = utcServiceDate,
                TimeSlot = dto.TimeSlot,
                ServiceNotes = dto.ServiceNotes,
                Status = "Pending"
            };

            _context.Bookings.Add(booking);
            
            // Add Activity log
            _context.ActivityLogs.Add(new ActivityLog
            {
                UserId = currentUserId,
                Action = "Booking Created",
                Details = $"Booking requested for {dto.ServiceDate:yyyy-MM-dd} at {dto.TimeSlot}"
            });

            await _context.SaveChangesAsync();
            
            return await GetByIdAsync(booking.Id);
        }

        public async Task<BookingDto?> UpdateStatusAsync(int id, string newStatus, string userRole, int currentUserId)
        {
            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Branch)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return null;

            if (userRole == "Customer")
            {
                if (booking.UserId != currentUserId) return null;
                if (newStatus != "Cancelled") return null;
            }

            string oldStatus = booking.Status;
            booking.Status = newStatus;

            _context.ActivityLogs.Add(new ActivityLog
            {
                UserId = currentUserId,
                Action = "Booking Status Updated",
                Details = $"Booking {booking.Id} changed from {oldStatus} to {newStatus}"
            });

            // DASHBOARD NOTIFICATION
            if (newStatus == "Approved" || newStatus == "Rejected")
            {
                var notification = new Notification
                {
                    UserId = booking.UserId,
                    Title = newStatus == "Approved" ? "✨ Booking Confirmed!" : "⚠️ Booking Update",
                    Message = newStatus == "Approved" 
                        ? $"Your booking for {booking.ServiceDate:MMMM dd} at {booking.TimeSlot} has been approved."
                        : $"Unfortunately, your booking for {booking.ServiceDate:MMMM dd} could not be approved at this time.",
                    Type = "BOOKING_STATUS",
                    RelatedId = booking.Id.ToString(),
                    IsRead = false
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();

            // ASYNCHRONOUS BACKGROUND EMAIL JOB
            if (newStatus == "Approved" || newStatus == "Rejected")
            {
                // Offload email sending to Hangfire background processing
                _backgroundJobClient.Enqueue<BackgroundJobs>(x => x.SendBookingStatusEmail(booking.Id, newStatus));
            }

            return MapToDto(booking);
        }

        private static BookingDto MapToDto(Booking booking)
        {
            return new BookingDto
            {
                Id = booking.Id,
                UserId = booking.UserId,
                CustomerName = booking.User?.Name ?? "Unknown",
                BranchId = booking.BranchId,
                BranchName = booking.Branch?.Name ?? "Unknown",
                VehicleId = booking.VehicleId,
                VehicleDetails = booking.Vehicle != null ? $"{booking.Vehicle.Make} {booking.Vehicle.Model}" : null,
                ServiceDate = booking.ServiceDate,
                TimeSlot = booking.TimeSlot,
                Status = booking.Status,
                ServiceNotes = booking.ServiceNotes,
                CreatedAt = booking.CreatedAt
            };
        }
    }
}
