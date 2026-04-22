using Microsoft.EntityFrameworkCore;
using vpsims.Data;
using vpsims.Interfaces;
using vpsims.Models;

namespace vpsims.Services
{
    public class SupportService : ISupportService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly IEmailService _emailService;

        public SupportService(AppDbContext context, INotificationService notificationService, IEmailService emailService)
        {
            _context = context;
            _notificationService = notificationService;
            _emailService = emailService;
        }

        public async Task<SupportTicket> CreateTicketAsync(int userId, string subject, string issueType, string priority, string initialMessage, List<string>? attachmentUrls)
        {
            var ticket = new SupportTicket
            {
                UserId = userId,
                Subject = subject,
                IssueType = issueType,
                Priority = priority,
                Status = "Open",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.SupportTickets.Add(ticket);
            await _context.SaveChangesAsync();

            // Initial Message
            await AddMessageAsync(ticket.Id, userId, initialMessage, attachmentUrls);

            // Notify Admins
            var admins = await _context.Users.Where(u => u.Role == "Admin").ToListAsync();
            foreach (var admin in admins)
            {
                await _notificationService.CreateNotificationAsync(admin.Id, "New Support Ticket", $"Customer {userId} created a ticket: {subject}", "SUPPORT_TICKET_NEW", ticket.Id.ToString());
            }

            return ticket;
        }

        public async Task<SupportMessage> AddMessageAsync(int ticketId, int senderId, string text, List<string>? attachmentUrls)
        {
            var ticket = await _context.SupportTickets
                .Include(t => t.User)
                .Include(t => t.AssignedStaff)
                .FirstOrDefaultAsync(t => t.Id == ticketId);
            
            if (ticket == null) throw new Exception("Ticket not found");

            var message = new SupportMessage
            {
                TicketId = ticketId,
                SenderId = senderId,
                Text = text,
                CreatedAt = DateTime.UtcNow
            };

            _context.SupportMessages.Add(message);
            await _context.SaveChangesAsync();

            if (attachmentUrls != null && attachmentUrls.Any())
            {
                foreach (var url in attachmentUrls)
                {
                    var fileName = Path.GetFileName(url);
                    var ext = Path.GetExtension(url).ToLower();
                    _context.SupportAttachments.Add(new SupportAttachment
                    {
                        SupportMessageId = message.Id,
                        FileUrl = url,
                        FileName = fileName,
                        FileType = ext == ".pdf" ? "PDF" : "Image"
                    });
                }
                await _context.SaveChangesAsync();
            }

            // Update ticket status if replied by staff/admin
            var sender = await _context.Users.FindAsync(senderId);
            if (sender != null && (sender.Role == "Admin" || sender.Role == "Staff"))
            {
                ticket.Status = "Replied";
                ticket.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Notify Customer
                await _notificationService.CreateNotificationAsync(ticket.UserId, "Support Reply", $"Team member {sender.Name} replied to your ticket: {ticket.Subject}", "SUPPORT_REPLY", ticket.Id.ToString());
                
                // Email Notification (Simplified call for now, will update interface soon)
                try {
                    await _emailService.SendEmailAsync(ticket.User.Email, "New Reply on Support Ticket", $"Hello {ticket.User.Name},\n\nA team member has replied to your support request: \"{text}\"\n\nLog in to the portal to view the full conversation.");
                } catch { /* Suppress email errors */ }
            }
            else if (sender != null && sender.Role == "Customer")
            {
                // Customer replied to an existing ticket
                ticket.UpdatedAt = DateTime.UtcNow;
                if (ticket.Status != "Open") ticket.Status = "Open"; // Mark as open for review
                await _context.SaveChangesAsync();

                // Notify Assigned Staff or Admin
                if (ticket.AssignedStaffId.HasValue)
                {
                    await _notificationService.CreateNotificationAsync(ticket.AssignedStaffId.Value, "Customer Message", $"New message from customer on ticket #{ticket.Id}", "SUPPORT_MESSAGE_CUSTOMER", ticket.Id.ToString());
                }
            }

            return message;
        }

        public async Task<List<SupportTicket>> GetUserTicketsAsync(int userId)
        {
            var tickets = await _context.SupportTickets
                .Where(t => t.UserId == userId)
                .OrderByDescending(t => t.UpdatedAt)
                .ToListAsync();

            foreach (var t in tickets)
            {
                t.UnreadCount = await _context.SupportMessages
                    .CountAsync(m => m.TicketId == t.Id && m.SenderId != userId && !m.IsRead);
            }

            return tickets;
        }

        public async Task<List<SupportTicket>> GetAllTicketsAsync()
        {
            var tickets = await _context.SupportTickets
                .Include(t => t.User)
                .Include(t => t.AssignedStaff)
                .OrderByDescending(t => t.UpdatedAt)
                .ToListAsync();

            // For admin, unread count is messages not from an admin/staff? 
            // Usually admin wants to see messages from customer.
            foreach (var t in tickets)
            {
                t.UnreadCount = await _context.SupportMessages
                    .CountAsync(m => m.TicketId == t.Id && !m.IsRead && 
                        _context.Users.Any(u => u.Id == m.SenderId && u.Role == "Customer"));
            }

            return tickets;
        }

        public async Task<List<SupportTicket>> GetAssignedTicketsAsync(int staffId)
        {
            var tickets = await _context.SupportTickets
                .Include(t => t.User)
                .Where(t => t.AssignedStaffId == staffId)
                .OrderByDescending(t => t.UpdatedAt)
                .ToListAsync();

            foreach (var t in tickets)
            {
                t.UnreadCount = await _context.SupportMessages
                    .CountAsync(m => m.TicketId == t.Id && m.SenderId != staffId && !m.IsRead);
            }

            return tickets;
        }

        public async Task<SupportTicket?> GetTicketDetailAsync(int ticketId)
        {
            return await _context.SupportTickets
                .Include(t => t.User)
                .Include(t => t.AssignedStaff)
                .Include(t => t.Messages.OrderBy(m => m.CreatedAt))
                    .ThenInclude(m => m.Sender)
                .Include(t => t.Messages)
                    .ThenInclude(m => m.Attachments)
                .FirstOrDefaultAsync(t => t.Id == ticketId);
        }

        public async Task<bool> UpdateTicketStatusAsync(int ticketId, string status)
        {
            var ticket = await _context.SupportTickets.FindAsync(ticketId);
            if (ticket == null) return false;

            ticket.Status = status;
            ticket.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AssignTicketAsync(int ticketId, int? staffId)
        {
            var ticket = await _context.SupportTickets.FindAsync(ticketId);
            if (ticket == null) return false;

            ticket.AssignedStaffId = staffId;
            ticket.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            if (staffId.HasValue)
            {
                await _notificationService.CreateNotificationAsync(staffId.Value, "Ticket Assigned", $"You have been assigned to Support Ticket #{ticket.Id}: {ticket.Subject}", "SUPPORT_TICKET_ASSIGNED", ticket.Id.ToString());
            }

            return true;
        }

        public async Task<bool> MarkMessagesAsReadAsync(int ticketId, int userId)
        {
            var messages = await _context.SupportMessages
                .Where(m => m.TicketId == ticketId && m.SenderId != userId && !m.IsRead)
                .ToListAsync();

            if (!messages.Any()) return false;

            foreach (var m in messages) 
            {
                m.IsRead = true;
                m.ReadAt = DateTime.UtcNow;
            }
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> GetUnreadSupportCountAsync(int userId)
        {
            // Unread messages on tickets where user is participant but not sender
            return await _context.SupportMessages
                .Include(m => m.Ticket)
                .CountAsync(m => m.Ticket.UserId == userId && m.SenderId != userId && !m.IsRead);
        }
    }
}
