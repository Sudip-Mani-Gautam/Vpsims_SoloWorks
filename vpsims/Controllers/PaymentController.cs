using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using vpsims.DTOs.Payment;
using vpsims.Interfaces;

namespace vpsims.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        // --- Business Payment Details ---

        [HttpGet("details")]
        public async Task<IActionResult> GetAllPaymentDetails()
        {
            // All authenticated users can view payment details
            var details = await _paymentService.GetAllPaymentDetailsAsync();
            return Ok(details);
        }

        [HttpPost("details")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreatePaymentDetail([FromBody] CreatePaymentDetailDto dto)
        {
            var detail = await _paymentService.CreatePaymentDetailAsync(dto);
            return CreatedAtAction(nameof(GetAllPaymentDetails), new { id = detail.Id }, detail);
        }

        [HttpPut("details/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdatePaymentDetail(int id, [FromBody] UpdatePaymentDetailDto dto)
        {
            var detail = await _paymentService.UpdatePaymentDetailAsync(id, dto);
            if (detail == null) return NotFound();
            return Ok(detail);
        }

        [HttpDelete("details/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePaymentDetail(int id)
        {
            var result = await _paymentService.DeletePaymentDetailAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }

        // --- Payment Submissions ---

        [HttpGet("submissions")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetAllSubmissions()
        {
            // Admin and Staff can view all submissions
            var submissions = await _paymentService.GetAllSubmissionsAsync();
            return Ok(submissions);
        }

        [HttpGet("submissions/my")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetMySubmissions()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var submissions = await _paymentService.GetSubmissionsByUserIdAsync(userId);
            return Ok(submissions);
        }

        [HttpPost("submissions")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateSubmission([FromBody] CreatePaymentSubmissionDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            try
            {
                var submission = await _paymentService.CreateSubmissionAsync(userId, dto);
                return Ok(submission);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPatch("submissions/{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateSubmissionStatus(int id, [FromBody] UpdatePaymentStatusDto dto)
        {
            if (dto.Status != "Verified" && dto.Status != "Rejected")
                return BadRequest(new { message = "Invalid status. Must be 'Verified' or 'Rejected'." });

            var submission = await _paymentService.UpdateSubmissionStatusAsync(id, dto);
            if (submission == null) return NotFound();
            return Ok(submission);
        }
    }
}
