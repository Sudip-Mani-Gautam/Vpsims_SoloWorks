namespace vpsims.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Customer"; // Admin, Staff, Customer
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public int LoyaltyPoints { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }

        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public ICollection<Review> Reviews { get; set; } = new List<Review>();
        public ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
        public ICollection<PartRequest> PartRequests { get; set; } = new List<PartRequest>();
        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public ICollection<PaymentSubmission> PaymentSubmissions { get; set; } = new List<PaymentSubmission>();
        public ICollection<SupportTicket> SupportTickets { get; set; } = new List<SupportTicket>();
    }
}
