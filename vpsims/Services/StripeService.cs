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

        public async Task<Session> CreateCheckoutSessionAsync(int orderId, decimal amount, string customerEmail)
        {
            // Convert NPR to USD for Stripe payment processing (Stripe does not support card payments in NPR for standard merchant regions)
            decimal amountInUsd = amount / 133m;
            if (amountInUsd < 0.50m) amountInUsd = 0.50m; // Stripe minimum charge is 0.50 USD

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            UnitAmount = (long)(amountInUsd * 100), // Stripe uses cents
                            Currency = "usd",
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = $"Order #{orderId} - VPSIMS",
                                Description = $"Payment for spare parts / service (Converted from NPR {amount:N2})",
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

            return session;
        }

        public async Task<bool> VerifyPaymentAsync(string sessionId)
        {
            var service = new SessionService();
            Session session = await service.GetAsync(sessionId);

            return session.PaymentStatus == "paid";
        }
    }
}
