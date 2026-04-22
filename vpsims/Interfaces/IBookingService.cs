using vpsims.DTOs;

namespace vpsims.Interfaces
{
    public interface IBookingService
    {
        Task<IEnumerable<BookingDto>> GetAllAsync(int? userId = null, int? branchId = null);
        Task<BookingDto?> GetByIdAsync(int id);
        Task<BookingDto?> CreateAsync(CreateBookingDto dto, string userRole, int currentUserId);
        Task<BookingDto?> UpdateStatusAsync(int id, string newStatus, string userRole, int currentUserId);
        Task<int> GetSlotAvailabilityAsync(int branchId, DateTime date, string timeSlot);
    }
}
