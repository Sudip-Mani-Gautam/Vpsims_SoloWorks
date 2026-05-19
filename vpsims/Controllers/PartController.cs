using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using vpsims.DTOs.Part;
using vpsims.Interfaces;

namespace vpsims.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PartController : ControllerBase
    {
        private readonly IPartService _partService;

        public PartController(IPartService partService)
        {
            _partService = partService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _partService.GetAllAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _partService.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpGet("category/{categoryId}")]
        public async Task<IActionResult> GetByCategory(int categoryId) =>
            Ok(await _partService.GetByCategoryAsync(categoryId));

        [HttpGet("supplier/{supplierId}")]
        public async Task<IActionResult> GetBySupplier(int supplierId) =>
            Ok(await _partService.GetBySupplierAsync(supplierId));

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string q) =>
            Ok(await _partService.SearchAsync(q));

        [HttpPost]
        [Authorize(Roles = "Admin,Staff")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreatePartDto dto)
        {
            try
            {
                var result = await _partService.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdatePartDto dto)
        {
            try
            {
                var result = await _partService.UpdateAsync(id, dto);
                return result == null ? NotFound() : Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _partService.DeleteAsync(id);
            return success ? NoContent() : NotFound();
        }

        [HttpPost("{id}/import")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> ImportStock(int id, [FromBody] ImportStockDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            int? userId = string.IsNullOrEmpty(userIdStr) ? null : int.Parse(userIdStr);

            var result = await _partService.ImportStockAsync(id, dto.Quantity, dto.Urgency, userId);
            return result == null ? NotFound() : Ok(result);
        }
    }

    public class ImportStockDto
    {
        public int Quantity { get; set; }
        public string Urgency { get; set; } = "Low";
    }
}
