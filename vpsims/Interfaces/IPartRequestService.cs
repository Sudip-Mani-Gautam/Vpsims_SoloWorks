using vpsims.DTOs.PartRequest;

namespace vpsims.Interfaces
{
    public interface IPartRequestService
    {
        Task<IEnumerable<PartRequestDto>> GetAllAsync();
        Task<IEnumerable<PartRequestDto>> GetByUserAsync(int userId);
        Task<PartRequestDto> CreateAsync(int userId, CreatePartRequestDto dto);
        Task<PartRequestDto?> UpdateStatusAsync(int id, UpdatePartRequestStatusDto dto);
        Task<bool> CancelAsync(int id, int userId);
        Task<bool> DeleteAsync(int id);
    }
}
