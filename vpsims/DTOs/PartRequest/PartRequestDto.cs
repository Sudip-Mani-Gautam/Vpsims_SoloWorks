namespace vpsims.DTOs.PartRequest
{
    public class PartRequestDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string PartName { get; set; } = string.Empty;
        public string? PartNumber { get; set; }
        public string VehicleModel { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string Priority { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending";
        public DateTime CreatedAt { get; set; }
    }

    public class CreatePartRequestDto
    {
        public string PartName { get; set; } = string.Empty;
        public string? PartNumber { get; set; }
        public string VehicleModel { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string Priority { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UpdatePartRequestStatusDto
    {
        public string Status { get; set; } = string.Empty; // Pending, Procuring, Available, Rejected
    }
}
