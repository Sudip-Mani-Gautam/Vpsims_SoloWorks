using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using vpsims.DTOs.Order;
using vpsims.Interfaces;
using vpsims.Data;

namespace vpsims.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        private readonly IPdfService _pdfService;
        private readonly AppDbContext _context;

        public OrderController(IOrderService orderService, IPdfService pdfService, AppDbContext context)
        {
            _orderService = orderService;
            _pdfService = pdfService;
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> GetAll() =>
            Ok(await _orderService.GetAllAsync());

        [HttpGet("my")]
        public async Task<IActionResult> GetMyOrders()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            return Ok(await _orderService.GetByUserAsync(userId));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _orderService.GetByIdAsync(id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _orderService.CreateAsync(userId, dto);
            if (result == null)
                return BadRequest(new { message = "Insufficient stock or invalid part." });

            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPatch("{id}/payment")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdatePayment(int id, [FromBody] UpdatePaymentStatusDto dto)
        {
            var result = await _orderService.UpdatePaymentStatusAsync(id, dto);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            var result = await _orderService.UpdateStatusAsync(id, dto);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost("{id}/send-invoice")]
        [Authorize(Roles = "Admin,Staff")]
        public async Task<IActionResult> SendInvoice(int id)
        {
            var success = await _orderService.SendInvoiceEmailAsync(id);
            return success ? Ok(new { message = "Invoice dispatched to distribution nexus." }) : NotFound();
        }

        [HttpGet("{id}/pdf")]
        [Authorize(Roles = "Admin,Staff,Customer")]
        public async Task<IActionResult> DownloadPdf(int id)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Part)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound();

            var pdfBytes = _pdfService.GenerateInvoicePdf(order);
            return File(pdfBytes, "application/pdf", $"Invoice_INV-{order.Id:D6}.pdf");
        }
    }
}
