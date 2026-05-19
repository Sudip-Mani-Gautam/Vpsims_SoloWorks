using vpsims.DTOs;

namespace vpsims.Interfaces
{
    public interface IVehicleService
    {
        Task<IEnumerable<VehicleDto>> GetAllAsync(int? userId = null);
        Task<VehicleDto?> GetByIdAsync(int id);
        Task<VehicleDto?> CreateAsync(CreateVehicleDto dto, string userRole, int currentUserId);
        Task<VehicleDto?> UpdateAsync(int id, CreateVehicleDto dto, string userRole, int currentUserId);
        Task<VehicleDto?> UpdateStatusAsync(int id, string status, string userRole, int currentUserId);
        Task<bool> DeleteAsync(int id, string userRole, int currentUserId);
    }
}
