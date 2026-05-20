using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using vpsims.Data;
using vpsims.DTOs;

namespace vpsims.Controllers
{
    [ApiController]
    [Route("api/purchase-invoices")]
    public class PurchaseInvoicesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly vpsims.Interfaces.IPdfService _pdfService;

        public PurchaseInvoicesController(AppDbContext context, vpsims.Interfaces.IPdfService pdfService)
        {
            _context = context;
            _pdfService = pdfService;
        }

        [HttpGet]
        [HttpGet("~/purchase-invoices")]
        public async Task<IActionResult> GetAll()
        {
            var invoices = await _context.PurchaseInvoices
                .Include(p => p.Supplier)
                .OrderByDescending(p => p.PurchaseDate)
                .ToListAsync();

            var dtos = invoices.Select(i => new PurchaseInvoiceDto {
                Id = i.Id,
                VendorName = i.Supplier?.Name ?? "Unknown",
                TotalAmount = i.TotalAmount,
                Status = i.Status,
                PurchaseDate = i.PurchaseDate,
                ItemsCount = i.ItemsCount
            }).ToList();

            return Ok(dtos);
        }

        [HttpGet("{id}/pdf")]
        public async Task<IActionResult> DownloadPdf(int id)
        {
            var invoice = await _context.PurchaseInvoices
                .Include(p => p.Supplier)
                .Include(p => p.Items)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (invoice == null) return NotFound();

            var pdfBytes = _pdfService.GeneratePurchaseInvoicePdf(invoice);
            return File(pdfBytes, "application/pdf", $"Purchase_PUR-{invoice.Id:D6}.pdf");
        }
    }
}
