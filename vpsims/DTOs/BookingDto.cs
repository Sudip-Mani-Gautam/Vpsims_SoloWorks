namespace vpsims.DTOs
{
    public class BookingDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public int? VehicleId { get; set; }
        public string? VehicleDetails { get; set; } // Make + Model
        public DateTime ServiceDate { get; set; }
        public string TimeSlot { get; set; } = null!;
        public string Status { get; set; } = "Pending";
        public string? ServiceNotes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateBookingDto
    {
        public int UserId { get; set; } // if admin/staff create for someone else
        public int BranchId { get; set; }
        public int? VehicleId { get; set; }
        public DateTime ServiceDate { get; set; }
        public string TimeSlot { get; set; } = null!;
        public string? ServiceNotes { get; set; }
    }

    public class UpdateBookingStatusDto
    {
        public string Status { get; set; } = null!; // Approved, Completed, Rejected, Cancelled
    }
}
