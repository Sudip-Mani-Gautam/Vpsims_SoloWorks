using Microsoft.EntityFrameworkCore;
using vpsims.Data;
using vpsims.DTOs.Review;
using vpsims.Interfaces;
using vpsims.Models;

namespace vpsims.Services
{
    public class ReviewService : IReviewService
    {
        private readonly AppDbContext _context;

        public ReviewService(AppDbContext context)
        {
            _context = context;
        }

        private static ReviewDto ToDto(Review r) => new()
        {
            Id = r.Id,
            UserId = r.UserId,
            UserName = r.User?.Name ?? "Unknown",
            Rating = r.Rating,
            Comment = r.Comment,
            Status = r.Status,
            CreatedAt = r.CreatedAt
        };

        public async Task<IEnumerable<ReviewDto>> GetAllAsync() =>
            (await _context.Reviews.Include(r => r.User).OrderByDescending(r => r.CreatedAt).ToListAsync()).Select(ToDto);

        public async Task<IEnumerable<ReviewDto>> GetApprovedAsync() =>
            (await _context.Reviews.Include(r => r.User).Where(r => r.Status == "Approved").OrderByDescending(r => r.CreatedAt).ToListAsync()).Select(ToDto);

        public async Task<IEnumerable<ReviewDto>> GetByUserIdAsync(int userId) =>
            (await _context.Reviews.Include(r => r.User).Where(r => r.UserId == userId).OrderByDescending(r => r.CreatedAt).ToListAsync()).Select(ToDto);

        public async Task<ReviewDto> CreateAsync(int userId, CreateReviewDto dto)
        {
            // Enforce limit: One review per month
            var lastReview = await _context.Reviews
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync();

            if (lastReview != null && lastReview.CreatedAt > DateTime.UtcNow.AddDays(-30))
            {
                var daysLeft = (lastReview.CreatedAt.AddDays(30) - DateTime.UtcNow).Days;
                throw new InvalidOperationException($"You can only submit one review per month. Please try again in {daysLeft} days.");
            }

            var review = new Review
            {
                UserId = userId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                Status = "Pending", // Requires Staff/Admin moderation
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            var full = await _context.Reviews.Include(r => r.User).FirstAsync(r => r.Id == review.Id);
            return ToDto(full);
        }

        public async Task<ReviewDto?> UpdateStatusAsync(int id, UpdateReviewStatusDto dto)
        {
            var review = await _context.Reviews.Include(r => r.User).FirstOrDefaultAsync(r => r.Id == id);
            if (review == null) return null;

            review.Status = dto.Status;
            await _context.SaveChangesAsync();

            return ToDto(review);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return false;

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
