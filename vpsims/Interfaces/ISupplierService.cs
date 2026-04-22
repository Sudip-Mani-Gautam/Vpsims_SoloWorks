using vpsims.DTOs.Supplier;

namespace vpsims.Interfaces
{
    public interface ISupplierService
    {
        Task<IEnumerable<SupplierDto>> GetAllAsync();
        Task<SupplierDto?> GetByIdAsync(int id);
        Task<SupplierDto> CreateAsync(CreateSupplierDto dto);
        Task<SupplierDto?> UpdateAsync(int id, UpdateSupplierDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
