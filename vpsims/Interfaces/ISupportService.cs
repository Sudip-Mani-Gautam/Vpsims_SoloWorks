using vpsims.Models;

namespace vpsims.Interfaces
{
    public interface ISupportService
    {
        Task<SupportTicket> CreateTicketAsync(int userId, string subject, string issueType, string priority, string initialMessage, List<string>? attachmentUrls);
        Task<SupportMessage> AddMessageAsync(int ticketId, int senderId, string text, List<string>? attachmentUrls);
        Task<List<SupportTicket>> GetUserTicketsAsync(int userId);
        Task<List<SupportTicket>> GetAllTicketsAsync();
        Task<List<SupportTicket>> GetAssignedTicketsAsync(int staffId);
        Task<SupportTicket?> GetTicketDetailAsync(int ticketId);
        Task<bool> UpdateTicketStatusAsync(int ticketId, string status);
        Task<bool> AssignTicketAsync(int ticketId, int? staffId);
        Task<bool> MarkMessagesAsReadAsync(int ticketId, int userId);
        Task<int> GetUnreadSupportCountAsync(int userId);
    }
}
