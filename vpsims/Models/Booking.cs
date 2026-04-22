namespace vpsims.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BranchId { get; set; }
        public int? VehicleId { get; set; }
        
        public DateTime ServiceDate { get; set; }
        public string TimeSlot { get; set; } = null!; // format: "09:00-10:00"
        public string Status { get; set; } = "Pending"; // Pending, Approved, Completed, Rejected
        public string? ServiceNotes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
        public Branch Branch { get; set; } = null!;
        public Vehicle? Vehicle { get; set; }
    }
}
