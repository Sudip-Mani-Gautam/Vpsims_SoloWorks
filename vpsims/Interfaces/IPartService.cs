using vpsims.DTOs.Part;

namespace vpsims.Interfaces
{
    public interface IPartService
    {
        Task<IEnumerable<PartDto>> GetAllAsync();
        Task<PartDto?> GetByIdAsync(int id);
        Task<IEnumerable<PartDto>> GetByCategoryAsync(int categoryId);
        Task<IEnumerable<PartDto>> GetBySupplierAsync(int supplierId);
        Task<PartDto> CreateAsync(CreatePartDto dto);
        Task<PartDto?> UpdateAsync(int id, UpdatePartDto dto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<PartDto>> SearchAsync(string query);
    }
}
