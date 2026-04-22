using System;

namespace vpsims.DTOs.Review
{
    public class ReviewDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = null!;
        public int Rating { get; set; }
        public string Comment { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateReviewDto
    {
        public int Rating { get; set; }
        public string Comment { get; set; } = null!;
    }

    public class UpdateReviewStatusDto
    {
        public string Status { get; set; } = null!; // Approved, Rejected
    }
}
