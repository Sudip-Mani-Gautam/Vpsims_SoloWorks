using Microsoft.EntityFrameworkCore;
using vpsims.Data;
using vpsims.Interfaces;
using vpsims.Models;

namespace vpsims.Services
{
    public class ActivityLogService : IActivityLogService
    {
        private readonly AppDbContext _context;

        public ActivityLogService(AppDbContext context)
        {
            _context = context;
        }

        public async Task LogAsync(int? userId, string action, string details)
        {
            var log = new ActivityLog
            {
                UserId = userId,
                Action = action,
                Details = details,
                Timestamp = DateTime.UtcNow
            };

            _context.ActivityLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<ActivityLog>> GetAllAsync()
        {
            return await _context.ActivityLogs
                .Include(a => a.User)
                .OrderByDescending(a => a.Timestamp)
                .ToListAsync();
        }
    }
}
