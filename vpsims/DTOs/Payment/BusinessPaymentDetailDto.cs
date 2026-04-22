namespace vpsims.DTOs.Payment
{
    public class BusinessPaymentDetailDto
    {
        public int Id { get; set; }
        public string BankName { get; set; } = null!;
        public string AccountName { get; set; } = null!;
        public string AccountNumber { get; set; } = null!;
        public string? BranchCode { get; set; }
        public string? ReferenceFormat { get; set; }
        public string? QRCodeImageUrl { get; set; }
        public string? Instructions { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreatePaymentDetailDto
    {
        public string BankName { get; set; } = null!;
        public string AccountName { get; set; } = null!;
        public string AccountNumber { get; set; } = null!;
        public string? BranchCode { get; set; }
        public string? ReferenceFormat { get; set; }
        public string? QRCodeImageUrl { get; set; }
        public string? Instructions { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UpdatePaymentDetailDto
    {
        public string BankName { get; set; } = null!;
        public string AccountName { get; set; } = null!;
        public string AccountNumber { get; set; } = null!;
        public string? BranchCode { get; set; }
        public string? ReferenceFormat { get; set; }
        public string? QRCodeImageUrl { get; set; }
        public string? Instructions { get; set; }
        public string? ContactEmail { get; set; }
        public string? ContactPhone { get; set; }
        public bool IsActive { get; set; }
    }
}
