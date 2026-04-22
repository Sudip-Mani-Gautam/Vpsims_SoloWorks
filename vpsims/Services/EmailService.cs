using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using vpsims.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using MimeKit.Text;

namespace vpsims.Services
{
    public class EmailService : IEmailService
    {
        private readonly ILogger<EmailService> _logger;
        private readonly IConfiguration _config;

        public EmailService(ILogger<EmailService> logger, IConfiguration config)
        {
            _logger = logger;
            _config = config;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                // Prioritize .env / environment variables, fallback to appsettings.json
                var host = Environment.GetEnvironmentVariable("SMTP_HOST") ?? _config["SmtpSettings:Host"];
                var portStr = Environment.GetEnvironmentVariable("SMTP_PORT") ?? _config["SmtpSettings:Port"];
                var user = Environment.GetEnvironmentVariable("SMTP_USER") ?? _config["SmtpSettings:User"];
                var pass = Environment.GetEnvironmentVariable("SMTP_PASS") ?? _config["SmtpSettings:Password"];

                int port = int.Parse(portStr ?? "587");

                if (string.IsNullOrEmpty(user) || user.Contains("yourgmail"))
                {
                    _logger.LogWarning("EMAIL SYSTEM BYPASSED: No valid SMTP credentials found in .env or appsettings.json.");
                    return;
                }

                var email = new MimeMessage();
                email.From.Add(MailboxAddress.Parse(user));
                email.To.Add(MailboxAddress.Parse(to));
                email.Subject = subject;
                email.Body = new TextPart(TextFormat.Html) { Text = body };

                using var smtp = new SmtpClient();
                
                // Connect to the SMTP server
                await smtp.ConnectAsync(host, port, SecureSocketOptions.StartTls);
                
                // Authenticate with the server
                await smtp.AuthenticateAsync(user, pass);
                
                // Send the email
                await smtp.SendAsync(email);
                
                // Disconnect
                await smtp.DisconnectAsync(true);

                _logger.LogInformation("EMAIL DISPATCHED SUCCESSFULLY TO: {To} via {Host}", to, host);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "FAILED TO DISPATCH EMAIL TO: {To}", to);
            }
        }

        public async Task SendInvoiceEmailAsync(string to, string invoiceNumber, decimal totalAmount, string itemsSummary)
        {
            var subject = $"Invoice {invoiceNumber} from VPSIMS";
            var body = $@"
                <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; color: #333;'>
                    <h2 style='color: #2c3e50;'>VPSIMS - Distribution Receipt</h2>
                    <p>Hello,</p>
                    <p>Please find the details of your invoice <strong>{invoiceNumber}</strong> below:</p>
                    <hr style='border: none; border-top: 1px solid #eee;' />
                    <p><strong>Total Amount:</strong> NPR {totalAmount:N2}</p>
                    <p><strong>Status:</strong> All Paid / Authorized</p>
                    <p><strong>Items Summarized:</strong></p>
                    <div style='background: #f9f9f9; padding: 10px; border-radius: 4px;'>{itemsSummary}</div>
                    <hr style='border: none; border-top: 1px solid #eee;' />
                    <p>Thank you for choosing VPSIMS Command Alpha.</p>
                    <p style='font-size: 10px; color: #999;'>This is an automated system message. Please do not reply directly.</p>
                </div>";

            await SendEmailAsync(to, subject, body);
        }

        public async Task SendBookingApprovalEmailAsync(string to, string customerName, DateTime serviceDate, string timeSlot, string branchName)
        {
            var subject = "✨ Booking Confirmed - VPSIMS Professional Service";
            var body = $@"
                <div style='font-family: Segoe UI, Roboto, sans-serif; padding: 40px; background-color: #f8fafc; color: #1e293b;'>
                    <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);'>
                        <div style='background: #3b82f6; padding: 24px; text-align: center;'>
                            <h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;'>VPSIMS COMMAND ALPHA</h1>
                        </div>
                        <div style='padding: 32px;'>
                            <h2 style='color: #1e293b; margin-top: 0;'>Great news, {customerName}!</h2>
                            <p style='font-size: 16px; line-height: 1.6;'>Your service booking has been **officially approved** by our distribution hub managers. We are preparing our tools and technicians for your arrival.</p>
                            
                            <div style='background: #eff6ff; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #dbeafe;'>
                                <p style='margin: 0; color: #1d4ed8; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;'>Appointment Details</p>
                                <div style='margin-top: 12px;'>
                                    <p style='margin: 4px 0;'>📅 <strong>Date:</strong> {serviceDate:MMMM dd, yyyy}</p>
                                    <p style='margin: 4px 0;'>⏰ <strong>Time:</strong> {timeSlot}</p>
                                    <p style='margin: 4px 0;'>📍 <strong>Location:</strong> {branchName} Hub</p>
                                </div>
                            </div>

                            <p style='font-size: 14px; color: #64748b;'>If you need to reschedule or have any technical inquiries, please contact your local branch representative.</p>
                            
                            <hr style='border: none; border-top: 1px solid #f1f5f9; margin: 32px 0;' />
                            <p style='font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px;'>Thank you for choosing VPSIMS,</p>
                            <p style='font-size: 14px; color: #64748b; margin-top: 0;'>The Operations Coordination Team</p>
                        </div>
                        <div style='background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8;'>
                            &copy; 2026 VPSIMS Global Distribution. Secure Transmission.
                        </div>
                    </div>
                </div>";

            await SendEmailAsync(to, subject, body);
        }

        public async Task SendBookingRejectionEmailAsync(string to, string customerName, DateTime serviceDate, string reason)
        {
            var subject = "⚠️ Update Regarding Your Booking - VPSIMS Distribution Hub";
            var body = $@"
                <div style='font-family: Segoe UI, Roboto, sans-serif; padding: 40px; background-color: #fef2f2; color: #1e293b;'>
                    <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);'>
                        <div style='background: #ef4444; padding: 24px; text-align: center;'>
                            <h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;'>VPSIMS OPERATIONS ALERT</h1>
                        </div>
                        <div style='padding: 32px;'>
                            <h2 style='color: #1e293b; margin-top: 0;'>Dear {customerName},</h2>
                            <p style='font-size: 16px; line-height: 1.6;'>We are writing to inform you that your service booking for **{serviceDate:MMMM dd, yyyy}** could not be approved at this time.</p>
                            
                            <div style='background: #fff1f2; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #fecdd3;'>
                                <p style='margin: 0; color: #be123c; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;'>Reason for System Rejection</p>
                                <p style='margin-top: 12px; font-size: 15px; color: #4b5563;'>{reason}</p>
                            </div>

                            <p style='font-size: 14px; color: #64748b;'>You may attempt to book another time slot through our portal, or contact our support staff for further assistance in coordinating your distribution requirements.</p>
                            
                            <hr style='border: none; border-top: 1px solid #f1f5f9; margin: 32px 0;' />
                            <p style='font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px;'>Regards,</p>
                            <p style='font-size: 14px; color: #64748b; margin-top: 0;'>The Logistics Management Team</p>
                        </div>
                        <div style='background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8;'>
                            &copy; 2026 VPSIMS Global Distribution. Automated Transmission.
                        </div>
                    </div>
                </div>";

            await SendEmailAsync(to, subject, body);
        }
    }
}
