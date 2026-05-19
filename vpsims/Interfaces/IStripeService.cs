using System.Collections.Generic;
using System.Threading.Tasks;
using Stripe.Checkout;

namespace vpsims.Interfaces
{
    public interface IStripeService
    {
        Task<Session> CreateCheckoutSessionAsync(int orderId, decimal amount, string customerEmail);
        Task<bool> VerifyPaymentAsync(string sessionId);
    }
}
