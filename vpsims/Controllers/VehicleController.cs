using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using vpsims.DTOs;
using vpsims.Interfaces;

namespace vpsims.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VehicleController : ControllerBase
    {
        private readonly IVehicleService _vehicleService;

        public VehicleController(IVehicleService vehicleService)
        {
            _vehicleService = vehicleService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            // Customers only see their own. Staff/Admin see all.
            var vehicles = await _vehicleService.GetAllAsync(role == "Customer" ? userId : null);
            return Ok(vehicles);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var vehicle = await _vehicleService.GetByIdAsync(id);
            if (vehicle == null) return NotFound();

            var role = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (role == "Customer" && vehicle.UserId != userId) return Forbid();

            return Ok(vehicle);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateVehicleDto dto)
        {
            var role = User.FindFirstValue(ClaimTypes.Role)!;
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var vehicle = await _vehicleService.CreateAsync(dto, role, userId);
            if (vehicle == null) return BadRequest("Invalid user or data.");

            return CreatedAtAction(nameof(GetById), new { id = vehicle.Id }, vehicle);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateVehicleDto dto)
        {
            var role = User.FindFirstValue(ClaimTypes.Role)!;
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var vehicle = await _vehicleService.UpdateAsync(id, dto, role, userId);
            if (vehicle == null) return NotFound();

            return Ok(vehicle);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var role = User.FindFirstValue(ClaimTypes.Role)!;
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var success = await _vehicleService.DeleteAsync(id, role, userId);
            if (!success) return NotFound();

            return NoContent();
        }
    }
}
