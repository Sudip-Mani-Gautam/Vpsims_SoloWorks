using System.Collections.Generic;
using System.Threading.Tasks;

namespace vpsims.Interfaces
{
    public interface IStripeService
    {
        Task<string> CreateCheckoutSessionAsync(int orderId, decimal amount, string customerEmail);
        Task<bool> VerifyPaymentAsync(string sessionId);
    }
}
