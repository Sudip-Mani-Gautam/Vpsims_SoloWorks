using vpsims.Models;

namespace vpsims.Interfaces
{
    public interface IActivityLogService
    {
        Task LogAsync(int? userId, string action, string details);
        Task<IEnumerable<ActivityLog>> GetAllAsync();
    }
}
