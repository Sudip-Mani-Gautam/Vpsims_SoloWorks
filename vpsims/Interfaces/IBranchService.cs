using vpsims.DTOs;

namespace vpsims.Interfaces
{
    public interface IBranchService
    {
        Task<IEnumerable<BranchDto>> GetAllAsync();
        Task<BranchDto?> GetByIdAsync(int id);
        Task<BranchDto> CreateAsync(CreateBranchDto dto);
        Task<BranchDto?> UpdateAsync(int id, CreateBranchDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
