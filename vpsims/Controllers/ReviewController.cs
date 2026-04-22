using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using vpsims.DTOs.Review;
using vpsims.Interfaces;

namespace vpsims.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetApproved() =>
            Ok(await _reviewService.GetApprovedAsync());

        [HttpGet("my")]
        public async Task<IActionResult> GetMy()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = int.Parse(userIdStr);
            return Ok(await _reviewService.GetByUserIdAsync(userId));
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetAll() =>
            Ok(await _reviewService.GetAllAsync());

        [HttpPost]
        public async Task<IActionResult> Create(CreateReviewDto dto)
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
                
                var userId = int.Parse(userIdStr);
                var result = await _reviewService.CreateAsync(userId, dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateStatus(int id, UpdateReviewStatusDto dto)
        {
            var result = await _reviewService.UpdateStatusAsync(id, dto);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _reviewService.DeleteAsync(id);
            return success ? NoContent() : NotFound();
        }
    }
}
