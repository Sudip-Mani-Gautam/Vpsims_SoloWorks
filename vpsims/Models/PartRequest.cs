namespace vpsims.Models
{
    public class PartRequest
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string PartName { get; set; } = null!;
        public string? PartNumber { get; set; }
        public string VehicleModel { get; set; } = null!;
        public int Quantity { get; set; } = 1;
        public string Priority { get; set; } = "Normal"; // Normal, Urgent, Critical
        public string Description { get; set; } = null!;
        public string Status { get; set; } = "Pending"; // Pending, Procuring, Available, Rejected
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
    }
}
