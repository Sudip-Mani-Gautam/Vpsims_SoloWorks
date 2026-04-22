using vpsims.DTOs.Review;

namespace vpsims.Interfaces
{
    public interface IReviewService
    {
        Task<IEnumerable<ReviewDto>> GetAllAsync();
        Task<IEnumerable<ReviewDto>> GetApprovedAsync();
        Task<IEnumerable<ReviewDto>> GetByUserIdAsync(int userId);
        Task<ReviewDto> CreateAsync(int userId, CreateReviewDto dto);
        Task<ReviewDto?> UpdateStatusAsync(int id, UpdateReviewStatusDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
