namespace vpsims.Interfaces
{
    public interface IPdfService
    {
        byte[] GenerateInvoicePdf(vpsims.Models.Order order);
    }
}
