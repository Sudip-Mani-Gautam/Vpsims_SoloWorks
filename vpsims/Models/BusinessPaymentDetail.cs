namespace vpsims.Models
{
    public class BusinessPaymentDetail
    {
        public int Id { get; set; }
        public string BankName { get; set; } = null!;
        public string AccountName { get; set; } = null!;
        public string AccountNumber { get; set; } = null!;
        public string? BranchCode { get; set; } // BSB
        public string? ReferenceFormat { get; set; } // e.g. INV-XXXXXX
        public string? QRCodeImageUrl { get; set; }
        public string? Instructions { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
