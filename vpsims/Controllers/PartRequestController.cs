using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using vpsims.DTOs.PartRequest;
using vpsims.Interfaces;

namespace vpsims.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PartRequestController : ControllerBase
    {
        private readonly IPartRequestService _requestService;

        public PartRequestController(IPartRequestService requestService)
        {
            _requestService = requestService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetAll() =>
            Ok(await _requestService.GetAllAsync());

        [HttpGet("my")]
        public async Task<IActionResult> GetMyRequests()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            return Ok(await _requestService.GetByUserAsync(userId));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreatePartRequestDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _requestService.CreateAsync(userId, dto);
            return Ok(result);
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateStatus(int id, UpdatePartRequestStatusDto dto)
        {
            var result = await _requestService.UpdateStatusAsync(id, dto);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPatch("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var success = await _requestService.CancelAsync(id, userId);
            return success ? Ok(new { message = "Request cancelled" }) : NotFound();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _requestService.DeleteAsync(id);
            return success ? NoContent() : NotFound();
        }
    }
}
