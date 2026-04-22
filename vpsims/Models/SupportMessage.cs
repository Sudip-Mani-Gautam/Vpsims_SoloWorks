using System.ComponentModel.DataAnnotations;

namespace vpsims.Models
{
    public class SupportMessage
    {
        public int Id { get; set; }
        
        [Required]
        public int TicketId { get; set; }
        public SupportTicket Ticket { get; set; } = null!;
        
        [Required]
        public int SenderId { get; set; }
        public User Sender { get; set; } = null!;
        
        [Required]
        public string Text { get; set; } = null!;
        
        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public List<SupportAttachment> Attachments { get; set; } = new();
    }
}
