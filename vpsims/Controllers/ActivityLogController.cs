using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using vpsims.Interfaces;

namespace vpsims.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class ActivityLogController : ControllerBase
    {
        private readonly IActivityLogService _activityLogService;

        public ActivityLogController(IActivityLogService activityLogService)
        {
            _activityLogService = activityLogService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var logs = await _activityLogService.GetAllAsync();
            return Ok(logs.Select(l => new {
                l.Id,
                l.Action,
                l.Details,
                l.Timestamp,
                UserName = l.User?.Name ?? "System"
            }));
        }
    }
}
