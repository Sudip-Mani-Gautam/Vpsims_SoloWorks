using vpsims.DTOs.Order;

namespace vpsims.Interfaces
{
    public interface IOrderService
    {
        Task<IEnumerable<OrderDto>> GetAllAsync();
        Task<IEnumerable<OrderDto>> GetByUserAsync(int userId);
        Task<OrderDto?> GetByIdAsync(int id);
        Task<OrderDto?> CreateAsync(int userId, CreateOrderDto dto);
        Task<OrderDto?> UpdateStatusAsync(int id, UpdateOrderStatusDto dto);
        Task<OrderDto?> UpdatePaymentStatusAsync(int id, UpdatePaymentStatusDto dto);
        Task<bool> SendInvoiceEmailAsync(int id);
    }
}
