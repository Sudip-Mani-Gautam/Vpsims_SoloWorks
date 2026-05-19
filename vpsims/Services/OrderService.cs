using Microsoft.EntityFrameworkCore;
using vpsims.Data;
using vpsims.DTOs.Order;
using vpsims.Interfaces;
using vpsims.Models;
using Hangfire;

namespace vpsims.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly INotificationService _notificationService;
        private readonly IEmailService _emailService;
        private readonly IPdfService _pdfService;
        private readonly IActivityLogService _activityLogService;
        private readonly IBackgroundJobClient _backgroundJobClient;

        public OrderService(AppDbContext context, INotificationService notificationService, IEmailService emailService, IPdfService pdfService, IActivityLogService activityLogService, IBackgroundJobClient backgroundJobClient)
        {
            _context = context;
            _notificationService = notificationService;
            _emailService = emailService;
            _pdfService = pdfService;
            _activityLogService = activityLogService;
            _backgroundJobClient = backgroundJobClient;
        }

        private static OrderDto ToDto(Order o) => new()
        {
            Id = o.Id,
            UserId = o.UserId,
            CustomerName = o.User?.Name ?? o.GuestName ?? "Guest Customer",
            CustomerEmail = o.User?.Email ?? "",
            CustomerPhone = o.User?.Phone ?? "",
            GuestName = o.GuestName,
            TotalAmount = o.TotalAmount,
            Status = o.Status,
            PaymentStatus = o.PaymentStatus,
            AmountPaid = o.AmountPaid,
            Notes = o.Notes,
            DueDate = o.DueDate,
            CreatedAt = o.CreatedAt,
            Items = o.OrderItems.Select(oi => new OrderItemDto
            {
                PartId = oi.PartId,
                PartName = oi.Part?.Name ?? "",
                Quantity = oi.Quantity,
                UnitPrice = oi.UnitPrice
            }).ToList()
        };

        private IQueryable<Order> WithIncludes() =>
            _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Part);

        public async Task<IEnumerable<OrderDto>> GetAllAsync() =>
            (await WithIncludes().OrderByDescending(o => o.CreatedAt).ToListAsync()).Select(ToDto);

        public async Task<IEnumerable<OrderDto>> GetByUserAsync(int userId) =>
            (await WithIncludes().Where(o => o.UserId == userId).OrderByDescending(o => o.CreatedAt).ToListAsync()).Select(ToDto);

        public async Task<OrderDto?> GetByIdAsync(int id)
        {
            var order = await WithIncludes().FirstOrDefaultAsync(o => o.Id == id);
            return order == null ? null : ToDto(order);
        }

        public async Task<OrderDto?> CreateAsync(int userId, CreateOrderDto dto)
        {
            decimal total = 0;
            var items = new List<OrderItem>();

            foreach (var item in dto.Items)
            {
                var part = await _context.Parts.FindAsync(item.PartId);
                if (part == null || part.StockQuantity < item.Quantity)
                    return null; // Part not found or insufficient stock

                part.StockQuantity -= item.Quantity;
                total += part.SellingPrice * item.Quantity;

                items.Add(new OrderItem
                {
                    PartId = item.PartId,
                    Quantity = item.Quantity,
                    UnitPrice = part.SellingPrice
                });
            }

            // ── Loyalty Program: 10% discount if > 5000 (A-16) ───────────
            if (total > 5000)
            {
                total *= 0.9m;
            }

            var order = new Order
            {
                UserId = dto.UserId ?? userId,
                GuestName = dto.GuestName,
                TotalAmount = total,
                Status = "Pending",
                PaymentStatus = dto.PaymentStatus,
                AmountPaid = dto.AmountPaid,
                Notes = dto.Notes,
                DueDate = dto.DueDate.HasValue ? DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc) : null,
                OrderItems = items
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Enqueue background email job automatically on creation
            _backgroundJobClient.Enqueue<BackgroundJobs>(x => x.SendInvoiceEmailJob(order.Id));

            await _activityLogService.LogAsync(userId, "INVOICE_CREATED", $"Order #{order.Id} created with total NPR {order.TotalAmount:N2}.");

            var full = await WithIncludes().FirstAsync(o => o.Id == order.Id);
            return ToDto(full);
        }

        public async Task<OrderDto?> UpdateStatusAsync(int id, UpdateOrderStatusDto dto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return null;

            order.Status = dto.Status;
            await _context.SaveChangesAsync();

            var full = await WithIncludes().FirstAsync(o => o.Id == order.Id);
            return ToDto(full);
        }

        public async Task<OrderDto?> UpdatePaymentStatusAsync(int id, UpdatePaymentStatusDto dto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return null;

            order.PaymentStatus = dto.PaymentStatus;
            order.AmountPaid = dto.AmountPaid;

            await _context.SaveChangesAsync();

            await _activityLogService.LogAsync(null, "PAYMENT_UPDATED", $"Order #{order.Id} payment status updated to {dto.PaymentStatus}.");

            // ── Loyalty Points Logic: 1 point per 100 currency units (A-16) ─
            if (dto.PaymentStatus == "Paid")
            {
                var user = await _context.Users.FindAsync(order.UserId);
                if (user != null)
                {
                    int pointsEarned = (int)(order.TotalAmount / 100);
                    user.LoyaltyPoints += pointsEarned;
                    await _context.SaveChangesAsync();
                }
            }

            // Notify User
            await _notificationService.CreateNotificationAsync(
                order.UserId,
                "Payment Update",
                $"Payment status for Order #{order.Id} has been updated to: {dto.PaymentStatus}.",
                "ORDER_PAYMENT_UPDATE",
                order.Id.ToString()
            );

            var full = await WithIncludes().FirstAsync(o => o.Id == order.Id);
            return ToDto(full);
        }

        public async Task<bool> SendInvoiceEmailAsync(int id)
        {
            var order = await WithIncludes().FirstOrDefaultAsync(o => o.Id == id);
            if (order == null || order.User == null) return false;

            var itemsSummary = string.Join(", ", order.OrderItems.Select(oi => $"{oi.Part?.Name} x{oi.Quantity}"));
            var invoiceNumber = $"INV-{order.Id:D6}";

            try
            {
                if (order.PaymentStatus == "Paid")
                {
                    await _emailService.SendInvoiceEmailAsync(
                        order.User.Email, 
                        invoiceNumber, 
                        order.TotalAmount, 
                        itemsSummary, 
                        order.PaymentStatus, 
                        order.AmountPaid
                    );
                }
                else if (order.DueDate.HasValue && DateTime.UtcNow > order.DueDate.Value)
                {
                    await _emailService.SendOverdueNoticeEmailAsync(
                        order.User.Email, 
                        invoiceNumber, 
                        order.TotalAmount - order.AmountPaid, 
                        itemsSummary, 
                        order.DueDate
                    );
                }
                else
                {
                    await _emailService.SendPaymentReminderEmailAsync(
                        order.User.Email, 
                        invoiceNumber, 
                        order.TotalAmount, 
                        itemsSummary, 
                        order.DueDate
                    );
                }
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
