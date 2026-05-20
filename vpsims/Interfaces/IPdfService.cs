namespace vpsims.Interfaces
{
    public interface IPdfService
    {
        byte[] GenerateInvoicePdf(vpsims.Models.Order order);
        byte[] GeneratePurchaseInvoicePdf(vpsims.Models.PurchaseInvoice invoice);
    }
}
