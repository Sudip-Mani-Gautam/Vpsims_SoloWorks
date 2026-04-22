using Microsoft.EntityFrameworkCore;
using vpsims.Data;
using vpsims.DTOs.Supplier;
using vpsims.Interfaces;
using vpsims.Models;

namespace vpsims.Services
{
    public class SupplierService : ISupplierService
    {
        private readonly AppDbContext _context;

        public SupplierService(AppDbContext context)
        {
            _context = context;
        }

        private static SupplierDto ToDto(Supplier s, int partCount = 0) => new()
        {
            Id = s.Id,
            Name = s.Name,
            ContactName = s.ContactName,
            Phone = s.Phone,
            Email = s.Email,
            Address = s.Address,
            Website = s.Website,
            TaxId = s.TaxId,
            Category = s.Category,
            IsActive = s.IsActive,
            PartCount = partCount
        };

        public async Task<IEnumerable<SupplierDto>> GetAllAsync()
        {
            return await _context.Suppliers
                .Include(s => s.Parts)
                .Select(s => new SupplierDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    ContactName = s.ContactName,
                    Phone = s.Phone,
                    Email = s.Email,
                    Address = s.Address,
                    Website = s.Website,
                    TaxId = s.TaxId,
                    Category = s.Category,
                    IsActive = s.IsActive,
                    PartCount = s.Parts.Count
                })
                .ToListAsync();
        }

        public async Task<SupplierDto?> GetByIdAsync(int id)
        {
            var s = await _context.Suppliers.Include(s => s.Parts).FirstOrDefaultAsync(s => s.Id == id);
            return s == null ? null : ToDto(s, s.Parts.Count);
        }

        public async Task<SupplierDto> CreateAsync(CreateSupplierDto dto)
        {
            var supplier = new Supplier
            {
                Name = dto.Name,
                ContactName = dto.ContactName,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address,
                Website = dto.Website,
                TaxId = dto.TaxId,
                Category = dto.Category,
                IsActive = dto.IsActive
            };

            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();
            return ToDto(supplier);
        }

        public async Task<SupplierDto?> UpdateAsync(int id, UpdateSupplierDto dto)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return null;

            supplier.Name = dto.Name;
            supplier.ContactName = dto.ContactName;
            supplier.Phone = dto.Phone;
            supplier.Email = dto.Email;
            supplier.Address = dto.Address;
            supplier.Website = dto.Website;
            supplier.TaxId = dto.TaxId;
            supplier.Category = dto.Category;
            supplier.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();
            return ToDto(supplier);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return false;

            _context.Suppliers.Remove(supplier);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
