namespace vpsims.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
        Task SendInvoiceEmailAsync(string to, string invoiceNumber, decimal totalAmount, string itemsSummary);
        Task SendBookingApprovalEmailAsync(string to, string customerName, DateTime serviceDate, string timeSlot, string branchName);
        Task SendBookingRejectionEmailAsync(string to, string customerName, DateTime serviceDate, string reason);
    }
}
