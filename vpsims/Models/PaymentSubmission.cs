using System.ComponentModel.DataAnnotations.Schema;

namespace vpsims.Models
{
    public class PaymentSubmission
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int OrderId { get; set; }
        public decimal AmountPaid { get; set; }
        public string PaymentMethod { get; set; } = null!; // Bank Transfer, Cash, Card, QR Payment
        public string? ReferenceNumber { get; set; }
        public DateTime PaymentDate { get; set; }
        public string? ProofImageUrl { get; set; } // Screenshot / Receipt
        public string? Notes { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, Verified, Rejected
        public string? RejectionReason { get; set; }
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

        // Stripe Integration
        public string? StripeSessionId { get; set; }
        public string? StripePaymentIntentId { get; set; }

        public User? User { get; set; }
        public Order? Order { get; set; }
    }
}
