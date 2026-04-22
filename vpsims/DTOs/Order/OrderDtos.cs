namespace vpsims.DTOs.Order
{
    public class OrderItemDto
    {
        public int PartId { get; set; }
        public string PartName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Subtotal => Quantity * UnitPrice;
    }

    public class CreateOrderItemDto
    {
        public int PartId { get; set; }
        public int Quantity { get; set; }
    }

    public class CreateOrderDto
    {
        public List<CreateOrderItemDto> Items { get; set; } = new();
        public decimal AmountPaid { get; set; } = 0;
        public string PaymentStatus { get; set; } = "Pending";
        public DateTime? DueDate { get; set; }
    }

    public class OrderDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public decimal AmountPaid { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }

    public class UpdateOrderStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }

    public class UpdatePaymentStatusDto
    {
        public string PaymentStatus { get; set; } = string.Empty;
        public decimal AmountPaid { get; set; }
    }
}
