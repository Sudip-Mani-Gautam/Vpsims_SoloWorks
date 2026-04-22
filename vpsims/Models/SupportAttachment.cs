using System.ComponentModel.DataAnnotations;

namespace vpsims.Models
{
    public class SupportAttachment
    {
        public int Id { get; set; }
        
        [Required]
        public int SupportMessageId { get; set; }
        public SupportMessage SupportMessage { get; set; } = null!;
        
        [Required]
        public string FileUrl { get; set; } = null!;
        
        [Required]
        public string FileName { get; set; } = null!;
        
        public string FileType { get; set; } = null!; // Image, PDF, etc.
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
