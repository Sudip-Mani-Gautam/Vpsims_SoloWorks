using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using vpsims.Data;
using vpsims.DTOs.Part;
using vpsims.Interfaces;
using vpsims.Models;

namespace vpsims.Services
{
    public class PartService : IPartService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IActivityLogService _activityLogService;

        public PartService(AppDbContext context, IWebHostEnvironment env, IActivityLogService activityLogService)
        {
            _context = context;
            _env = env;
            _activityLogService = activityLogService;
        }

        private async Task<string> SaveImageAsync(IFormFile? file, string currentUrl)
        {
            if (file == null || file.Length == 0) return currentUrl;

            var folder = Path.Combine(_env.WebRootPath, "images", "parts");
            if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(folder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/images/parts/{fileName}";
        }

        private static PartDto ToDto(Part p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            SKU = p.SKU,
            MarkedPrice = p.MarkedPrice,
            SellingPrice = p.SellingPrice,
            CostPrice = p.CostPrice,
            StockQuantity = p.StockQuantity,
            IsActive = p.IsActive,
            Brand = p.Brand,
            CompatibleVehicleModel = p.CompatibleVehicleModel,
            MinimumStockAlertLevel = p.MinimumStockAlertLevel,
            RackLocation = p.RackLocation,
            MarginType = p.MarginType,
            MarginPercentage = p.MarginPercentage,
            MarginAmount = p.MarginAmount,
            MinimumOrderQuantity = p.MinimumOrderQuantity,
            WarrantyPeriod = p.WarrantyPeriod,
            DeliveryTime = p.DeliveryTime,
            Notes = p.Notes,
            ImageUrl = p.ImageUrl,
            CategoryId = p.CategoryId,
            CategoryName = p.Category?.Name ?? "",
            SupplierId = p.SupplierId,
            SupplierName = p.Supplier?.Name ?? ""
        };

        private IQueryable<Part> WithIncludes() =>
            _context.Parts.Include(p => p.Category).Include(p => p.Supplier);

        public async Task<IEnumerable<PartDto>> GetAllAsync() =>
            await WithIncludes().Select(p => new PartDto
            {
                Id = p.Id, Name = p.Name, Description = p.Description, SKU = p.SKU,
                MarkedPrice = p.MarkedPrice, SellingPrice = p.SellingPrice, CostPrice = p.CostPrice, StockQuantity = p.StockQuantity, IsActive = p.IsActive, ImageUrl = p.ImageUrl,
                Brand = p.Brand, CompatibleVehicleModel = p.CompatibleVehicleModel, MinimumStockAlertLevel = p.MinimumStockAlertLevel, RackLocation = p.RackLocation,
                MarginType = p.MarginType, MarginPercentage = p.MarginPercentage, MarginAmount = p.MarginAmount, MinimumOrderQuantity = p.MinimumOrderQuantity, WarrantyPeriod = p.WarrantyPeriod, DeliveryTime = p.DeliveryTime, Notes = p.Notes,
                CategoryId = p.CategoryId, CategoryName = p.Category!.Name,
                SupplierId = p.SupplierId, SupplierName = p.Supplier!.Name
            }).ToListAsync();

        public async Task<PartDto?> GetByIdAsync(int id)
        {
            var p = await WithIncludes().FirstOrDefaultAsync(p => p.Id == id);
            return p == null ? null : ToDto(p);
        }

        public async Task<IEnumerable<PartDto>> GetByCategoryAsync(int categoryId) =>
            await WithIncludes()
                .Where(p => p.CategoryId == categoryId)
                .Select(p => new PartDto
                {
                    MarkedPrice = p.MarkedPrice, SellingPrice = p.SellingPrice, CostPrice = p.CostPrice, StockQuantity = p.StockQuantity, IsActive = p.IsActive, ImageUrl = p.ImageUrl,
                    Brand = p.Brand, CompatibleVehicleModel = p.CompatibleVehicleModel, MinimumStockAlertLevel = p.MinimumStockAlertLevel, RackLocation = p.RackLocation,
                    MarginType = p.MarginType, MarginPercentage = p.MarginPercentage, MarginAmount = p.MarginAmount, MinimumOrderQuantity = p.MinimumOrderQuantity, WarrantyPeriod = p.WarrantyPeriod, DeliveryTime = p.DeliveryTime, Notes = p.Notes,
                    CategoryId = p.CategoryId, CategoryName = p.Category!.Name,
                    SupplierId = p.SupplierId, SupplierName = p.Supplier!.Name
                }).ToListAsync();

        public async Task<IEnumerable<PartDto>> GetBySupplierAsync(int supplierId) =>
            await WithIncludes()
                .Where(p => p.SupplierId == supplierId)
                .Select(p => new PartDto
                {
                    Id = p.Id, Name = p.Name, Description = p.Description, SKU = p.SKU,
                    MarkedPrice = p.MarkedPrice, SellingPrice = p.SellingPrice, CostPrice = p.CostPrice, StockQuantity = p.StockQuantity, IsActive = p.IsActive, ImageUrl = p.ImageUrl,
                    Brand = p.Brand, CompatibleVehicleModel = p.CompatibleVehicleModel, MinimumStockAlertLevel = p.MinimumStockAlertLevel, RackLocation = p.RackLocation,
                    MarginType = p.MarginType, MarginPercentage = p.MarginPercentage, MarginAmount = p.MarginAmount, MinimumOrderQuantity = p.MinimumOrderQuantity, WarrantyPeriod = p.WarrantyPeriod, DeliveryTime = p.DeliveryTime, Notes = p.Notes,
                    CategoryId = p.CategoryId, CategoryName = p.Category!.Name,
                    SupplierId = p.SupplierId, SupplierName = p.Supplier!.Name
                }).ToListAsync();

        public async Task<IEnumerable<PartDto>> SearchAsync(string query) =>
            await WithIncludes()
                .Where(p => p.Name.ToLower().Contains(query.ToLower()) ||
                            p.SKU.ToLower().Contains(query.ToLower()) ||
                            p.Description.ToLower().Contains(query.ToLower()))
                .Select(p => new PartDto
                {
                    Id = p.Id, Name = p.Name, Description = p.Description, SKU = p.SKU,
                    MarkedPrice = p.MarkedPrice, SellingPrice = p.SellingPrice, CostPrice = p.CostPrice, StockQuantity = p.StockQuantity, IsActive = p.IsActive, ImageUrl = p.ImageUrl,
                    Brand = p.Brand, CompatibleVehicleModel = p.CompatibleVehicleModel, MinimumStockAlertLevel = p.MinimumStockAlertLevel, RackLocation = p.RackLocation,
                    MarginType = p.MarginType, MarginPercentage = p.MarginPercentage, MarginAmount = p.MarginAmount, MinimumOrderQuantity = p.MinimumOrderQuantity, WarrantyPeriod = p.WarrantyPeriod, DeliveryTime = p.DeliveryTime, Notes = p.Notes,
                    CategoryId = p.CategoryId, CategoryName = p.Category!.Name,
                    SupplierId = p.SupplierId, SupplierName = p.Supplier!.Name
                }).ToListAsync();

        public async Task<PartDto> CreateAsync(CreatePartDto dto)
        {
            // 1. Uniqueness Guard
            if (await _context.Parts.AnyAsync(p => p.SKU == dto.SKU))
                throw new Exception($"Reference SKU '{dto.SKU}' is already registered in the ledger.");

            // 2. Relational Integrity Checks
            if (!await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId))
                throw new Exception("The selected Product Category does not exist.");
            
            if (!await _context.Suppliers.AnyAsync(s => s.Id == dto.SupplierId))
                throw new Exception("The selected Primary Source Supplier is invalid.");

            // 3. Image Processing
            var imageUrl = await SaveImageAsync(dto.ImageFile, dto.ImageUrl);
            
            if (dto.StockQuantity < 0)
                throw new Exception("Initial inventory levels cannot be negative.");

            // Calculate Selling Price based on Margin
            decimal calculatedSellingPrice = dto.SellingPrice;
            if (dto.MarginType == "Percentage")
            {
                calculatedSellingPrice = dto.CostPrice + (dto.CostPrice * dto.MarginPercentage / 100);
            }
            else if (dto.MarginType == "Fixed Amount")
            {
                calculatedSellingPrice = dto.CostPrice + dto.MarginAmount;
            }

            var part = new Part
            {
                Name = dto.Name, Description = dto.Description, SKU = dto.SKU,
                MarkedPrice = dto.MarkedPrice, SellingPrice = calculatedSellingPrice, CostPrice = dto.CostPrice, StockQuantity = dto.StockQuantity,
                Brand = dto.Brand, CompatibleVehicleModel = dto.CompatibleVehicleModel, MinimumStockAlertLevel = dto.MinimumStockAlertLevel, RackLocation = dto.RackLocation,
                MarginType = dto.MarginType, MarginPercentage = dto.MarginPercentage, MarginAmount = dto.MarginAmount, MinimumOrderQuantity = dto.MinimumOrderQuantity,
                WarrantyPeriod = dto.WarrantyPeriod, DeliveryTime = dto.DeliveryTime, Notes = dto.Notes,
                ImageUrl = imageUrl, CategoryId = dto.CategoryId, SupplierId = dto.SupplierId
            };

            _context.Parts.Add(part);
            await _context.SaveChangesAsync();

            await _activityLogService.LogAsync(null, "PART_CREATED", $"Part '{part.Name}' (SKU: {part.SKU}) added to inventory with {part.StockQuantity} units.");

            var full = await WithIncludes().FirstAsync(p => p.Id == part.Id);
            return ToDto(full);
        }

        public async Task<PartDto?> UpdateAsync(int id, UpdatePartDto dto)
        {
            var part = await _context.Parts.FindAsync(id);
            if (part == null) return null;

            // 1. Uniqueness Guard (Excluding Self)
            if (await _context.Parts.AnyAsync(p => p.SKU == dto.SKU && p.Id != id))
                throw new Exception($"Reference SKU '{dto.SKU}' is currently assigned to another component.");

            // 2. Relational Integrity Checks
            if (!await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId))
                throw new Exception("The selected Category is no longer available.");
            
            if (!await _context.Suppliers.AnyAsync(s => s.Id == dto.SupplierId))
                throw new Exception("The selected Supplier record is restricted or missing.");

            // 3. Image Logic
            part.ImageUrl = await SaveImageAsync(dto.ImageFile, dto.ImageUrl);

            if (dto.StockQuantity < 0)
                throw new Exception("Inventory levels cannot be set to a negative value.");

            // Calculate Selling Price based on Margin
            decimal calculatedSellingPrice = dto.SellingPrice;
            if (dto.MarginType == "Percentage")
            {
                calculatedSellingPrice = dto.CostPrice + (dto.CostPrice * dto.MarginPercentage / 100);
            }
            else if (dto.MarginType == "Fixed Amount")
            {
                calculatedSellingPrice = dto.CostPrice + dto.MarginAmount;
            }

            part.Name = dto.Name;
            part.Description = dto.Description;
            part.SKU = dto.SKU;
            part.MarkedPrice = dto.MarkedPrice;
            part.SellingPrice = calculatedSellingPrice;
            part.CostPrice = dto.CostPrice;
            part.StockQuantity = dto.StockQuantity;
            
            part.Brand = dto.Brand;
            part.CompatibleVehicleModel = dto.CompatibleVehicleModel;
            part.MinimumStockAlertLevel = dto.MinimumStockAlertLevel;
            part.RackLocation = dto.RackLocation;
            
            part.MarginType = dto.MarginType;
            part.MarginPercentage = dto.MarginPercentage;
            part.MarginAmount = dto.MarginAmount;
            part.MinimumOrderQuantity = dto.MinimumOrderQuantity;
            part.WarrantyPeriod = dto.WarrantyPeriod;
            part.DeliveryTime = dto.DeliveryTime;
            part.Notes = dto.Notes;
            
            part.CategoryId = dto.CategoryId;
            part.SupplierId = dto.SupplierId;

            await _context.SaveChangesAsync();
            
            await _activityLogService.LogAsync(null, "STOCK_UPDATED", $"Part '{part.Name}' details/stock updated. New quantity: {part.StockQuantity}.");

            var full = await WithIncludes().FirstAsync(p => p.Id == part.Id);
            return ToDto(full);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var part = await _context.Parts.FindAsync(id);
            if (part == null) return false;
            _context.Parts.Remove(part);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
