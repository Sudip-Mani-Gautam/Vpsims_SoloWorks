using Microsoft.EntityFrameworkCore;
using vpsims.Data;
using vpsims.DTOs.Payment;
using vpsims.Interfaces;
using vpsims.Models;

namespace vpsims.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public PaymentService(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // --- Business Payment Details ---

        public async Task<IEnumerable<BusinessPaymentDetailDto>> GetAllPaymentDetailsAsync()
        {
            return await _context.BusinessPaymentDetails
                .Select(p => new BusinessPaymentDetailDto
                {
                    Id = p.Id,
                    BankName = p.BankName,
                    AccountName = p.AccountName,
                    AccountNumber = p.AccountNumber,
                    BranchCode = p.BranchCode,
                    ReferenceFormat = p.ReferenceFormat,
                    QRCodeImageUrl = p.QRCodeImageUrl,
                    Instructions = p.Instructions,
                    ContactEmail = p.ContactEmail,
                    ContactPhone = p.ContactPhone,
                    IsActive = p.IsActive,
                    CreatedAt = p.CreatedAt
                })
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<BusinessPaymentDetailDto?> GetPaymentDetailByIdAsync(int id)
        {
            var p = await _context.BusinessPaymentDetails.FindAsync(id);
            if (p == null) return null;

            return new BusinessPaymentDetailDto
            {
                Id = p.Id,
                BankName = p.BankName,
                AccountName = p.AccountName,
                AccountNumber = p.AccountNumber,
                BranchCode = p.BranchCode,
                ReferenceFormat = p.ReferenceFormat,
                QRCodeImageUrl = p.QRCodeImageUrl,
                Instructions = p.Instructions,
                ContactEmail = p.ContactEmail,
                ContactPhone = p.ContactPhone,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt
            };
        }

        public async Task<BusinessPaymentDetailDto> CreatePaymentDetailAsync(CreatePaymentDetailDto dto)
        {
            var paymentDetail = new BusinessPaymentDetail
            {
                BankName = dto.BankName,
                AccountName = dto.AccountName,
                AccountNumber = dto.AccountNumber,
                BranchCode = dto.BranchCode,
                ReferenceFormat = dto.ReferenceFormat,
                QRCodeImageUrl = dto.QRCodeImageUrl,
                Instructions = dto.Instructions,
                ContactEmail = dto.ContactEmail,
                ContactPhone = dto.ContactPhone,
                IsActive = dto.IsActive,
                CreatedAt = DateTime.UtcNow
            };

            _context.BusinessPaymentDetails.Add(paymentDetail);
            await _context.SaveChangesAsync();

            return await GetPaymentDetailByIdAsync(paymentDetail.Id) ?? throw new Exception("Failed to retrieve created record.");
        }

        public async Task<BusinessPaymentDetailDto?> UpdatePaymentDetailAsync(int id, UpdatePaymentDetailDto dto)
        {
            var paymentDetail = await _context.BusinessPaymentDetails.FindAsync(id);
            if (paymentDetail == null) return null;

            paymentDetail.BankName = dto.BankName;
            paymentDetail.AccountName = dto.AccountName;
            paymentDetail.AccountNumber = dto.AccountNumber;
            paymentDetail.BranchCode = dto.BranchCode;
            paymentDetail.ReferenceFormat = dto.ReferenceFormat;
            paymentDetail.QRCodeImageUrl = dto.QRCodeImageUrl;
            paymentDetail.Instructions = dto.Instructions;
            paymentDetail.ContactEmail = dto.ContactEmail;
            paymentDetail.ContactPhone = dto.ContactPhone;
            paymentDetail.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return await GetPaymentDetailByIdAsync(id);
        }

        public async Task<bool> DeletePaymentDetailAsync(int id)
        {
            var paymentDetail = await _context.BusinessPaymentDetails.FindAsync(id);
            if (paymentDetail == null) return false;

            _context.BusinessPaymentDetails.Remove(paymentDetail);
            await _context.SaveChangesAsync();
            return true;
        }

        // --- Payment Submissions ---

        public async Task<IEnumerable<PaymentSubmissionDto>> GetAllSubmissionsAsync()
        {
            return await _context.PaymentSubmissions
                .Include(p => p.User)
                .Select(p => new PaymentSubmissionDto
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    UserName = p.User != null ? p.User.Name : "Unknown",
                    OrderId = p.OrderId,
                    AmountPaid = p.AmountPaid,
                    PaymentMethod = p.PaymentMethod,
                    ReferenceNumber = p.ReferenceNumber,
                    PaymentDate = p.PaymentDate,
                    ProofImageUrl = p.ProofImageUrl,
                    Notes = p.Notes,
                    Status = p.Status,
                    RejectionReason = p.RejectionReason,
                    SubmittedAt = p.SubmittedAt,
                    StripeSessionId = p.StripeSessionId
                })
                .OrderByDescending(p => p.SubmittedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<PaymentSubmissionDto>> GetSubmissionsByUserIdAsync(int userId)
        {
            return await _context.PaymentSubmissions
                .Include(p => p.User)
                .Where(p => p.UserId == userId)
                .Select(p => new PaymentSubmissionDto
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    UserName = p.User != null ? p.User.Name : "Unknown",
                    OrderId = p.OrderId,
                    AmountPaid = p.AmountPaid,
                    PaymentMethod = p.PaymentMethod,
                    ReferenceNumber = p.ReferenceNumber,
                    PaymentDate = p.PaymentDate,
                    ProofImageUrl = p.ProofImageUrl,
                    Notes = p.Notes,
                    Status = p.Status,
                    RejectionReason = p.RejectionReason,
                    SubmittedAt = p.SubmittedAt,
                    StripeSessionId = p.StripeSessionId
                })
                .OrderByDescending(p => p.SubmittedAt)
                .ToListAsync();
        }

        public async Task<PaymentSubmissionDto?> GetSubmissionByIdAsync(int id)
        {
            var p = await _context.PaymentSubmissions
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.Id == id);
                
            if (p == null) return null;

            return new PaymentSubmissionDto
            {
                Id = p.Id,
                UserId = p.UserId,
                UserName = p.User != null ? p.User.Name : "Unknown",
                OrderId = p.OrderId,
                AmountPaid = p.AmountPaid,
                PaymentMethod = p.PaymentMethod,
                ReferenceNumber = p.ReferenceNumber,
                PaymentDate = p.PaymentDate,
                ProofImageUrl = p.ProofImageUrl,
                Notes = p.Notes,
                Status = p.Status,
                RejectionReason = p.RejectionReason,
                SubmittedAt = p.SubmittedAt,
                StripeSessionId = p.StripeSessionId
            };
        }

        public async Task<PaymentSubmissionDto?> CreateSubmissionAsync(int userId, CreatePaymentSubmissionDto dto)
        {
            // Verify order exists and belongs to user
            var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == dto.OrderId && o.UserId == userId);
            if (order == null) throw new Exception("Order not found or access denied.");

            var submission = new PaymentSubmission
            {
                UserId = userId,
                OrderId = dto.OrderId,
                AmountPaid = dto.AmountPaid,
                PaymentMethod = dto.PaymentMethod,
                ReferenceNumber = dto.ReferenceNumber,
                PaymentDate = dto.PaymentDate,
                ProofImageUrl = dto.ProofImageUrl,
                Notes = dto.Notes,
                Status = "Pending",
                SubmittedAt = DateTime.UtcNow
            };

            _context.PaymentSubmissions.Add(submission);
            await _context.SaveChangesAsync();

            return await GetSubmissionByIdAsync(submission.Id);
        }

        public async Task<PaymentSubmissionDto?> UpdateSubmissionStatusAsync(int id, UpdatePaymentStatusDto dto)
        {
            var submission = await _context.PaymentSubmissions
                .Include(s => s.User)
                .Include(s => s.Order)
                .FirstOrDefaultAsync(s => s.Id == id);
                
            if (submission == null) return null;

            submission.Status = dto.Status;
            submission.RejectionReason = dto.Status == "Rejected" ? dto.RejectionReason : null;

            if (dto.Status == "Verified" && submission.Order != null)
            {
                var order = submission.Order;
                var totalVerifiedPaid = await _context.PaymentSubmissions
                    .Where(p => p.OrderId == order.Id && p.Status == "Verified" && p.Id != submission.Id)
                    .SumAsync(p => p.AmountPaid);

                totalVerifiedPaid += submission.AmountPaid;

                if (totalVerifiedPaid >= order.TotalAmount)
                {
                    order.PaymentStatus = "Paid";
                    order.AmountPaid = order.TotalAmount;
                    order.Status = "Completed"; // Mark order as completed if fully paid
                }
                else if (totalVerifiedPaid > 0)
                {
                    order.PaymentStatus = "Partial Paid";
                    order.AmountPaid = totalVerifiedPaid;
                }
                else
                {
                    order.PaymentStatus = "Unpaid";
                }
            }

            await _context.SaveChangesAsync();

            // Notify User
            if (submission.User != null)
            {
                var notification = new Notification
                {
                    UserId = submission.UserId,
                    Title = $"Payment {dto.Status}",
                    Message = $"Your payment of NPR {submission.AmountPaid:N2} for Order #{submission.OrderId} has been {dto.Status.ToLower()}.",
                    Type = "PAYMENT_UPDATE",
                    RelatedId = submission.OrderId.ToString(),
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
                await _context.SaveChangesAsync();

                // Send Email Notification
                var emailBody = $"Hello {submission.User.Name},<br/><br/>" +
                                $"Your payment submission for Order #{submission.OrderId} has been marked as <b>{dto.Status}</b>.<br/>";
                if (dto.Status == "Rejected" && !string.IsNullOrEmpty(dto.RejectionReason))
                {
                    emailBody += $"Reason: {dto.RejectionReason}<br/>";
                }
                emailBody += "<br/>Thank you,<br/>VPSIMS Team";

                await _emailService.SendEmailAsync(submission.User.Email, $"Payment {dto.Status} - Order #{submission.OrderId}", emailBody);
            }

            return await GetSubmissionByIdAsync(id);
        }
    }
}
