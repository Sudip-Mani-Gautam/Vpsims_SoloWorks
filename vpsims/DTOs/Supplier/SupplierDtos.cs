namespace vpsims.DTOs.Supplier
{
    public class SupplierDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? Website { get; set; }
        public string? TaxId { get; set; }
        public string? Category { get; set; }
        public bool IsActive { get; set; }
        public int PartCount { get; set; }
    }

    public class CreateSupplierDto
    {
        public string Name { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? Website { get; set; }
        public string? TaxId { get; set; }
        public string? Category { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UpdateSupplierDto
    {
        public string Name { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? Website { get; set; }
        public string? TaxId { get; set; }
        public string? Category { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
