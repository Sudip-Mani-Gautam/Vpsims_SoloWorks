namespace vpsims.Models
{
    public class Vehicle
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Make { get; set; } = null!;
        public string Model { get; set; } = null!;
        public int Year { get; set; }
        public string? LicensePlate { get; set; }
        public string? VIN { get; set; }
        public int Mileage { get; set; } = 0;
        public DateTime? LastServiceDate { get; set; }

        public User User { get; set; } = null!;
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
