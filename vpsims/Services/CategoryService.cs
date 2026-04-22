using Microsoft.EntityFrameworkCore;
using vpsims.Data;
using vpsims.DTOs.Category;
using vpsims.Interfaces;
using vpsims.Models;

namespace vpsims.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly AppDbContext _context;

        public CategoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync()
        {
            return await _context.Categories
                .Include(c => c.Parts)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,
                    PartCount = c.Parts.Count
                })
                .ToListAsync();
        }

        public async Task<CategoryDto?> GetByIdAsync(int id)
        {
            var c = await _context.Categories
                .Include(c => c.Parts)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (c == null) return null;

            return new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                PartCount = c.Parts.Count
            };
        }

        public async Task<CategoryDto> CreateAsync(CreateCategoryDto dto)
        {
            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return new CategoryDto { Id = category.Id, Name = category.Name, Description = category.Description, PartCount = 0 };
        }

        public async Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return null;

            category.Name = dto.Name;
            category.Description = dto.Description;
            await _context.SaveChangesAsync();

            return new CategoryDto { Id = category.Id, Name = category.Name, Description = category.Description };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return false;

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
