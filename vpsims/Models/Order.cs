namespace vpsims.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Processing, Completed, Cancelled
        public string PaymentStatus { get; set; } = "Pending"; // Paid, Credit, Partial, Pending
        public decimal AmountPaid { get; set; } = 0;
        public string? GuestName { get; set; }
        public string? Notes { get; set; }
        public DateTime? DueDate { get; set; } // For credit/partial payments
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<PaymentSubmission> PaymentSubmissions { get; set; } = new List<PaymentSubmission>();
    }
}
