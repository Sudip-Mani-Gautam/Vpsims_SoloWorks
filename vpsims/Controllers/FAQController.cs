using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using vpsims.Data;
using vpsims.Models;

namespace vpsims.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FAQController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FAQController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetPublishedFAQs()
        {
            var faqs = await _context.FAQs
                .Where(f => f.IsPublished)
                .OrderBy(f => f.DisplayOrder)
                .ToListAsync();
            return Ok(faqs);
        }

        [HttpGet("all")]
        [Authorize(Roles = "Admin,admin,Staff,staff")]
        public async Task<IActionResult> GetAllFAQs()
        {
            var faqs = await _context.FAQs
                .OrderBy(f => f.DisplayOrder)
                .ToListAsync();
            return Ok(faqs);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,admin,Staff,staff")]
        public async Task<IActionResult> CreateFAQ(FAQ faq)
        {
            _context.FAQs.Add(faq);
            await _context.SaveChangesAsync();
            return Ok(faq);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,admin,Staff,staff")]
        public async Task<IActionResult> UpdateFAQ(int id, FAQ faq)
        {
            var existing = await _context.FAQs.FindAsync(id);
            if (existing == null) return NotFound();

            existing.Question = faq.Question;
            existing.Answer = faq.Answer;
            existing.Category = faq.Category;
            existing.DisplayOrder = faq.DisplayOrder;
            existing.IsPublished = faq.IsPublished;
            existing.HexColor = faq.HexColor;

            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,admin,Staff,staff")]
        public async Task<IActionResult> DeleteFAQ(int id)
        {
            var faq = await _context.FAQs.FindAsync(id);
            if (faq == null) return NotFound();
            _context.FAQs.Remove(faq);
            await _context.SaveChangesAsync();
            return Ok(new { message = "FAQ Deleted" });
        }
    }
}
