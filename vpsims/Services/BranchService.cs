using Microsoft.EntityFrameworkCore;
using vpsims.Data;
using vpsims.DTOs;
using vpsims.Interfaces;
using vpsims.Models;

namespace vpsims.Services
{
    public class BranchService : IBranchService
    {
        private readonly AppDbContext _context;

        public BranchService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BranchDto>> GetAllAsync()
        {
            var branches = await _context.Branches.ToListAsync();
            return branches.Select(MapToDto);
        }

        public async Task<BranchDto?> GetByIdAsync(int id)
        {
            var branch = await _context.Branches.FindAsync(id);
            return branch == null ? null : MapToDto(branch);
        }

        public async Task<BranchDto> CreateAsync(CreateBranchDto dto)
        {
            var branch = new Branch
            {
                Name = dto.Name,
                Address = dto.Address,
                Phone = dto.Phone,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude
            };

            _context.Branches.Add(branch);
            await _context.SaveChangesAsync();

            return MapToDto(branch);
        }

        public async Task<BranchDto?> UpdateAsync(int id, CreateBranchDto dto)
        {
            var branch = await _context.Branches.FindAsync(id);
            if (branch == null) return null;

            branch.Name = dto.Name;
            branch.Address = dto.Address;
            branch.Phone = dto.Phone;
            branch.Latitude = dto.Latitude;
            branch.Longitude = dto.Longitude;

            await _context.SaveChangesAsync();
            return MapToDto(branch);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var branch = await _context.Branches.FindAsync(id);
            if (branch == null) return false;

            _context.Branches.Remove(branch);
            await _context.SaveChangesAsync();
            return true;
        }

        private static BranchDto MapToDto(Branch branch)
        {
            return new BranchDto
            {
                Id = branch.Id,
                Name = branch.Name,
                Address = branch.Address,
                Phone = branch.Phone,
                Latitude = branch.Latitude,
                Longitude = branch.Longitude,
                IsActive = branch.IsActive
            };
        }
    }
}
