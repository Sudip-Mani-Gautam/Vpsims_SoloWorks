using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using vpsims.Data;

namespace vpsims.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PredictionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PredictionController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("my-predictions")]
        public async Task<IActionResult> GetMyPredictions()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var vehicles = await _context.Vehicles
                .Where(v => v.UserId == userId)
                .ToListAsync();

            var predictions = new List<object>();

            foreach (var v in vehicles)
            {
                // Brake Pads Prediction
                if (v.Mileage > 40000)
                {
                    predictions.Add(new {
                        Id = Guid.NewGuid(),
                        Vehicle = $"{v.Make} {v.Model}",
                        Part = "Brake Pads",
                        Severity = "High",
                        Message = $"Based on your mileage ({v.Mileage:N0} km), brake pads typically require replacement. High safety priority.",
                        Action = "Schedule Brake Inspection",
                        Confidence = 85
                    });
                }

                // Timing Belt Prediction
                if (v.Mileage > 60000 && v.Mileage < 80000)
                {
                    predictions.Add(new {
                        Id = Guid.NewGuid(),
                        Vehicle = $"{v.Make} {v.Model}",
                        Part = "Timing Belt",
                        Severity = "Medium",
                        Message = $"Your {v.Make} is approaching the critical 80k km mark. Timing belt failure can cause engine damage.",
                        Action = "Plan replacement in next 5,000 km",
                        Confidence = 72
                    });
                }

                // Oil Filter / General Service
                var monthsSinceService = v.LastServiceDate.HasValue ? (DateTime.UtcNow - v.LastServiceDate.Value).TotalDays / 30 : 12;
                if (monthsSinceService > 6)
                {
                    predictions.Add(new {
                        Id = Guid.NewGuid(),
                        Vehicle = $"{v.Make} {v.Model}",
                        Part = "Oil & Filters",
                        Severity = monthsSinceService > 12 ? "High" : "Low",
                        Message = $"It has been {monthsSinceService:F1} months since your last recorded service. Fresh lubricants maintain engine integrity.",
                        Action = "Book Standard Maintenance",
                        Confidence = 90
                    });
                }
            }

            // Fallback generic predictions if no specific data
            if (predictions.Count == 0)
            {
                predictions.Add(new {
                    Id = Guid.NewGuid(),
                    Vehicle = "Generic Diagnostic",
                    Part = "Air Filter",
                    Severity = "Low",
                    Message = "Regular air filter checks are recommended every 15,000 km for optimal fuel efficiency.",
                    Action = "Visual inspection at next stop",
                    Confidence = 60
                });
            }

            return Ok(predictions);
        }
    }
}
