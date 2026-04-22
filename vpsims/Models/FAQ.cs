using System.ComponentModel.DataAnnotations;

namespace vpsims.Models
{
    public class FAQ
    {
        public int Id { get; set; }
        
        [Required]
        public string Question { get; set; } = null!;
        
        [Required]
        public string Answer { get; set; } = null!;
        
        public string? Category { get; set; } // e.g. "Orders", "Warranty", "Technical"
        
        public int DisplayOrder { get; set; } = 0;
        
        public bool IsPublished { get; set; } = true;
        
        public string? HexColor { get; set; } // For row styling
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
