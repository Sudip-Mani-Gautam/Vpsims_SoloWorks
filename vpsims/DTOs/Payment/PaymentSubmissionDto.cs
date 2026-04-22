namespace vpsims.DTOs.Payment
{
    public class PaymentSubmissionDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int OrderId { get; set; }
        public decimal AmountPaid { get; set; }
        public string PaymentMethod { get; set; } = null!;
        public string? ReferenceNumber { get; set; }
        public DateTime PaymentDate { get; set; }
        public string? ProofImageUrl { get; set; }
        public string? Notes { get; set; }
        public string Status { get; set; } = null!;
        public string? RejectionReason { get; set; }
        public DateTime SubmittedAt { get; set; }
        public string? StripeSessionId { get; set; }
    }

    public class CreatePaymentSubmissionDto
    {
        public int OrderId { get; set; }
        public decimal AmountPaid { get; set; }
        public string PaymentMethod { get; set; } = null!; // Bank Transfer, Cash, Card, QR Payment
        public string? ReferenceNumber { get; set; }
        public DateTime PaymentDate { get; set; }
        public string? ProofImageUrl { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdatePaymentStatusDto
    {
        public string Status { get; set; } = null!; // Verified, Rejected
        public string? RejectionReason { get; set; }
    }
}
