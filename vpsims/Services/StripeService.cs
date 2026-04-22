using Microsoft.Extensions.Configuration;
using Stripe;
using Stripe.Checkout;
using System.Collections.Generic;
using System.Threading.Tasks;
using vpsims.Interfaces;

namespace vpsims.Services
{
    public class StripeService : IStripeService
    {
        private readonly IConfiguration _configuration;

        public StripeService(IConfiguration configuration)
        {
            _configuration = configuration;
            StripeConfiguration.ApiKey = _configuration["StripeSettings:SecretKey"];
        }

        public async Task<string> CreateCheckoutSessionAsync(int orderId, decimal amount, string customerEmail)
        {
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            UnitAmount = (long)(amount * 100), // Stripe uses cents
                            Currency = "npr", // Using NPR as per earlier context
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = $"Order #{orderId} - VPSIMS",
                                Description = "Payment for spare parts / service",
                            },
                        },
                        Quantity = 1,
                    },
                },
                Mode = "payment",
                SuccessUrl = _configuration["StripeSettings:SuccessUrl"].Replace("{ORDER_ID}", orderId.ToString()),
                CancelUrl = _configuration["StripeSettings:CancelUrl"],
                CustomerEmail = customerEmail,
                ClientReferenceId = orderId.ToString(),
                Metadata = new Dictionary<string, string>
                {
                    { "orderId", orderId.ToString() }
                }
            };

            var service = new SessionService();
            Session session = await service.CreateAsync(options);

            return session.Id;
        }

        public async Task<bool> VerifyPaymentAsync(string sessionId)
        {
            var service = new SessionService();
            Session session = await service.GetAsync(sessionId);

            return session.PaymentStatus == "paid";
        }
    }
}
