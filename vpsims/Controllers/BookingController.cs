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
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var branchIdParam = Request.Query["branchId"];
            int? bId = int.TryParse(branchIdParam, out var b) ? b : null;

            var bookings = await _bookingService.GetAllAsync(role == "Customer" ? userId : null, bId);
            return Ok(bookings);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var booking = await _bookingService.GetByIdAsync(id);
            if (booking == null) return NotFound();

            var role = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            if (role == "Customer" && booking.UserId != userId) return Forbid();

            return Ok(booking);
        }

        [HttpGet("availability")]
        public async Task<IActionResult> GetAvailability([FromQuery] int branchId, [FromQuery] DateTime date, [FromQuery] string timeSlot)
        {
            var slotsLeft = await _bookingService.GetSlotAvailabilityAsync(branchId, date, timeSlot);
            return Ok(new { AvailableSlots = slotsLeft, IsFull = slotsLeft == 0 });
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateBookingDto dto)
        {
            var role = User.FindFirstValue(ClaimTypes.Role)!;
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            try
            {
                var booking = await _bookingService.CreateAsync(dto, role, userId);
                if (booking == null) return BadRequest("Invalid branch or data.");
                return CreatedAtAction(nameof(GetById), new { id = booking.Id }, booking);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateBookingStatusDto dto)
        {
            var role = User.FindFirstValue(ClaimTypes.Role)!;
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var booking = await _bookingService.UpdateStatusAsync(id, dto.Status, role, userId);
            if (booking == null) return Forbid("You do not have permission to change this booking status.");

            return Ok(booking);
        }
        [HttpGet("pending-count")]
        public async Task<IActionResult> GetPendingCount()
        {
            var role = User.FindFirstValue(ClaimTypes.Role);
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            var branchIdParam = Request.Query["branchId"];
            int? bId = int.TryParse(branchIdParam, out var b) ? b : null;

            var bookings = await _bookingService.GetAllAsync(role == "Customer" ? userId : null, bId);
            
            // "Pending" bookings
            var count = bookings.Count(b => b.Status == "Pending");
            return Ok(new { count });
        }
    }
}
