using System.ComponentModel.DataAnnotations;

namespace vpsims.Models
{
    public class SupportTicket
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        public User User { get; set; } = null!;
        
        public int? AssignedStaffId { get; set; }
        public User? AssignedStaff { get; set; }
        
        [Required]
        public string Subject { get; set; } = null!;
        
        [Required]
        public string IssueType { get; set; } = null!; // General, Payment, Invoice, Booking, PartRequest, Complaint, Technical
        
        public string Status { get; set; } = "Open"; // Open, InProgress, Replied, Resolved, Closed
        public string Priority { get; set; } = "Medium"; // Low, Medium, High, Urgent
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public List<SupportMessage> Messages { get; set; } = new();

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public int UnreadCount { get; set; }
    }
}
