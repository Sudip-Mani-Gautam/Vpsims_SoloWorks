namespace vpsims.Interfaces
{
    public interface INotificationService
    {
        Task CreateNotificationAsync(int userId, string title, string message, string? type = null, string? relatedId = null);
        Task<int> GetUnreadCountAsync(int userId);
    }
}
