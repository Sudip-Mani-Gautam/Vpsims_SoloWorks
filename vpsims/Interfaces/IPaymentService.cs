using vpsims.DTOs.Payment;

namespace vpsims.Interfaces
{
    public interface IPaymentService
    {
        // Business Payment Details (Admin setup)
        Task<IEnumerable<BusinessPaymentDetailDto>> GetAllPaymentDetailsAsync();
        Task<BusinessPaymentDetailDto?> GetPaymentDetailByIdAsync(int id);
        Task<BusinessPaymentDetailDto> CreatePaymentDetailAsync(CreatePaymentDetailDto dto);
        Task<BusinessPaymentDetailDto?> UpdatePaymentDetailAsync(int id, UpdatePaymentDetailDto dto);
        Task<bool> DeletePaymentDetailAsync(int id);

        // Payment Submissions (Customer actions & Admin verification)
        Task<IEnumerable<PaymentSubmissionDto>> GetAllSubmissionsAsync();
        Task<IEnumerable<PaymentSubmissionDto>> GetSubmissionsByUserIdAsync(int userId);
        Task<PaymentSubmissionDto?> GetSubmissionByIdAsync(int id);
        Task<PaymentSubmissionDto?> CreateSubmissionAsync(int userId, CreatePaymentSubmissionDto dto);
        Task<PaymentSubmissionDto?> UpdateSubmissionStatusAsync(int id, UpdatePaymentStatusDto dto);
    }
}
