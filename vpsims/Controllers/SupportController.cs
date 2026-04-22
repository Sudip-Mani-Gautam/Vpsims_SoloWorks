using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using vpsims.Interfaces;
using vpsims.Models;

namespace vpsims.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SupportController : ControllerBase
    {
        private readonly ISupportService _supportService;

        public SupportController(ISupportService supportService)
        {
            _supportService = supportService;
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyTickets()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var tickets = await _supportService.GetUserTicketsAsync(userId);
            return Ok(tickets);
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> GetAllTickets()
        {
            var tickets = await _supportService.GetAllTicketsAsync();
            return Ok(tickets);
        }

        [HttpGet("assigned")]
        [Authorize(Roles = "Staff,staff,Admin,admin")]
        public async Task<IActionResult> GetAssignedTickets()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var tickets = await _supportService.GetAssignedTicketsAsync(userId);
            return Ok(tickets);
        }

        [HttpGet("ticket/{id}")]
        public async Task<IActionResult> GetTicket(int id)
        {
            var ticket = await _supportService.GetTicketDetailAsync(id);
            if (ticket == null) return NotFound();

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            // Security check
            if (role != "Admin" && role != "Staff" && ticket.UserId != userId)
                return Forbid();

            // Mark as read
            await _supportService.MarkMessagesAsReadAsync(id, userId);

            return Ok(ticket);
        }

        [HttpPost("ticket")]
        public async Task<IActionResult> CreateTicket([FromBody] CreateTicketDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var ticket = await _supportService.CreateTicketAsync(userId, dto.Subject, dto.IssueType, dto.Priority, dto.Message, dto.AttachmentUrls);
            return Ok(ticket);
        }

        [HttpPost("ticket/{id}/message")]
        public async Task<IActionResult> AddMessage(int id, [FromBody] AddMessageDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var message = await _supportService.AddMessageAsync(id, userId, dto.Text, dto.AttachmentUrls);
            return Ok(message);
        }

        [HttpPatch("ticket/{id}/status")]
        [Authorize(Roles = "Admin,admin,Staff,staff")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var result = await _supportService.UpdateTicketStatusAsync(id, dto.Status);
            if (!result) return NotFound();
            return Ok(new { message = "Status updated" });
        }

        [HttpPatch("ticket/{id}/assign")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> AssignTicket(int id, [FromBody] AssignTicketDto dto)
        {
            var result = await _supportService.AssignTicketAsync(id, dto.StaffId);
            if (!result) return NotFound();
            return Ok(new { message = "Ticket assigned" });
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
            var count = await _supportService.GetUnreadSupportCountAsync(userId);
            return Ok(new { count });
        }
    }

    public class CreateTicketDto
    {
        public string Subject { get; set; } = null!;
        public string IssueType { get; set; } = null!;
        public string Priority { get; set; } = "Medium";
        public string Message { get; set; } = null!;
        public List<string>? AttachmentUrls { get; set; }
    }

    public class AddMessageDto
    {
        public string Text { get; set; } = null!;
        public List<string>? AttachmentUrls { get; set; }
    }

    public class UpdateStatusDto { public string Status { get; set; } = null!; }
    public class AssignTicketDto { public int? StaffId { get; set; } }
}
