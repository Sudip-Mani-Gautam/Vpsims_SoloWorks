using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using vpsims.Data;
using vpsims.Interfaces;

namespace vpsims.Services
{
    public class BackgroundJobs
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<BackgroundJobs> _logger;

        public BackgroundJobs(AppDbContext context, IEmailService emailService, ILogger<BackgroundJobs> logger)
        {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task ProcessOverdueInvoices()
        {
            _logger.LogInformation("STARTING OVERDUE INVOICE SCAN...");

            var today = DateTime.UtcNow;
            var overdueOrders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Part)
                .Where(o => o.PaymentStatus != "Paid" && o.DueDate < today)
                .ToListAsync();

            _logger.LogInformation("Found {Count} overdue transactions.", overdueOrders.Count);

            foreach (var order in overdueOrders)
            {
                if (order.User == null) continue;

                var invoiceNumber = $"INV-{order.Id:D6}";
                var itemsSummary = string.Join(", ", order.OrderItems.Select(oi => $"{oi.Part?.Name} x{oi.Quantity}"));
                
                _logger.LogInformation("TRANSMITTING OVERDUE ALERT FOR {Invoice} TO {Email}", invoiceNumber, order.User.Email);
                
                try
                {
                    await _emailService.SendOverdueNoticeEmailAsync(
                        order.User.Email,
                        invoiceNumber,
                        order.TotalAmount - order.AmountPaid,
                        itemsSummary,
                        order.DueDate
                    );
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to deliver overdue alert for {Invoice}", invoiceNumber);
                }
            }

            _logger.LogInformation("OVERDUE INVOICE SCAN COMPLETED.");
        }

        public async Task SendBookingStatusEmail(int bookingId, string status)
        {
            _logger.LogInformation("BACKGROUND JOB: STARTING BOOKING STATUS EMAIL FOR ID {Id} - STATUS {Status}", bookingId, status);
            
            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Branch)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking?.User == null || string.IsNullOrEmpty(booking.User.Email))
            {
                _logger.LogWarning("BACKGROUND JOB FAILED: Booking {Id} or user email not found.", bookingId);
                return;
            }

            try
            {
                if (status == "Approved")
                {
                    await _emailService.SendBookingApprovalEmailAsync(
                        booking.User.Email,
                        booking.User.Name,
                        booking.ServiceDate,
                        booking.TimeSlot,
                        booking.Branch?.Name ?? "Main"
                    );
                }
                else if (status == "Rejected")
                {
                    await _emailService.SendBookingRejectionEmailAsync(
                        booking.User.Email,
                        booking.User.Name,
                        booking.ServiceDate,
                        "Capacity constraints or scheduling conflict in the distribution nexus."
                    );
                }
                
                _logger.LogInformation("BACKGROUND JOB SUCCESS: Email delivered for booking {Id}", bookingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "BACKGROUND JOB CRITICAL FAILURE: Could not deliver email for booking {Id}", bookingId);
                throw; // Rethrow for Hangfire retry mechanism
            }
        }

        public async Task SendInvoiceEmailJob(int orderId)
        {
            _logger.LogInformation("BACKGROUND JOB: STARTING INVOICE EMAIL FOR ID {Id}", orderId);

            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Part)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order?.User == null || string.IsNullOrEmpty(order.User.Email))
            {
                _logger.LogWarning("BACKGROUND JOB FAILED: Order {Id} or user email not found.", orderId);
                return;
            }

            var itemsSummary = string.Join(", ", order.OrderItems.Select(oi => $"{oi.Part?.Name} x{oi.Quantity}"));
            var invoiceNumber = $"INV-{order.Id:D6}";

            try
            {
                await _emailService.SendInvoiceEmailAsync(order.User.Email, invoiceNumber, order.TotalAmount, itemsSummary, order.PaymentStatus, order.AmountPaid);
                _logger.LogInformation("BACKGROUND JOB SUCCESS: Email delivered for invoice {Id}", orderId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "BACKGROUND JOB CRITICAL FAILURE: Could not deliver email for invoice {Id}", orderId);
                throw; // Rethrow for Hangfire retry mechanism
            }
        }
    }
}
