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
            var componentWear = new List<object>();
            var maintenanceTimeline = new List<object>();
            var aiTips = new List<object>();

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

                // -- Component Wear --
                int brakeWear = Math.Min(100, v.Mileage / 800);
                componentWear.Add(new { name = "Brake Pads", wear = brakeWear, status = brakeWear > 80 ? "Critical" : brakeWear > 60 ? "Warning" : brakeWear > 40 ? "Monitor" : "Good", vehicle = v.Make });
                
                int oilWear = Math.Min(100, (int)(monthsSinceService * 10)); 
                componentWear.Add(new { name = "Engine Oil", wear = oilWear, status = oilWear > 80 ? "Critical" : oilWear > 50 ? "Monitor" : "Good", vehicle = v.Make });
                
                int tyreWear = Math.Min(100, v.Mileage / 1000);
                componentWear.Add(new { name = "Tyres", wear = tyreWear, status = tyreWear > 80 ? "Critical" : tyreWear > 50 ? "Monitor" : "Good", vehicle = v.Make });
                
                // -- Maintenance Timeline --
                int daysUntilOilChange = Math.Max(0, 180 - (int)(monthsSinceService * 30));
                maintenanceTimeline.Add(new { label = $"Oil Change ({v.Make})", due = daysUntilOilChange, unit = "days", severity = daysUntilOilChange < 30 ? "High" : "Medium" });
                
                int daysUntilInspection = Math.Max(0, 365 - (int)(monthsSinceService * 30));
                maintenanceTimeline.Add(new { label = $"Annual Service ({v.Make})", due = daysUntilInspection, unit = "days", severity = daysUntilInspection < 60 ? "Medium" : "Low" });

                // -- AI Tips --
                if (brakeWear > 60) {
                    aiTips.Add(new { tip = $"Your {v.Make}'s brake pads show accelerated wear — avoid hard braking.", severity = "High" });
                }
                if (monthsSinceService > 6) {
                    aiTips.Add(new { tip = $"Fresh engine oil for your {v.Make} will improve fuel efficiency.", severity = "Medium" });
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
                componentWear.Add(new { name = "Air Filter", wear = 30, status = "Good", vehicle = "Generic" });
                componentWear.Add(new { name = "Battery", wear = 45, status = "Good", vehicle = "Generic" });
                maintenanceTimeline.Add(new { label = "Routine Checkup", due = 90, unit = "days", severity = "Low" });
            }
            
            if (aiTips.Count == 0) {
                aiTips.Add(new { tip = "Schedule your next service before the monsoon season for optimal performance.", severity = "Low" });
            }

            return Ok(new {
                predictions = predictions,
                componentWear = componentWear,
                maintenanceTimeline = maintenanceTimeline,
                aiTips = aiTips
            });
        }
    }
}
