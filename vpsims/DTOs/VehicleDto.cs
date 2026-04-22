namespace vpsims.DTOs
{
    public class VehicleDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Make { get; set; } = null!;
        public string Model { get; set; } = null!;
        public int Year { get; set; }
        public string? LicensePlate { get; set; }
        public string? VIN { get; set; }
    }

    public class CreateVehicleDto
    {
        public int UserId { get; set; } // The customer this vehicle belongs to
        public string Make { get; set; } = null!;
        public string Model { get; set; } = null!;
        public int Year { get; set; }
        public string? LicensePlate { get; set; }
        public string? VIN { get; set; }
    }
}
