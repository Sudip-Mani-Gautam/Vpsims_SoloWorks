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

        public async Task SendInvoiceEmailAsync(string to, string invoiceNumber, decimal totalAmount, string itemsSummary, string paymentStatus, decimal amountPaid)
        {
            var subject = $"Invoice {invoiceNumber} from VPSIMS";
            
            decimal remainingAmount = Math.Max(0, totalAmount - amountPaid);
            string statusHtml;

            if (paymentStatus.Equals("Paid", StringComparison.OrdinalIgnoreCase))
            {
                statusHtml = "<span style='color: #16a34a; font-weight: 700;'>Fully Paid / Settled</span>";
            }
            else if (amountPaid > 0 && remainingAmount > 0)
            {
                statusHtml = $"<span style='color: #ea580c; font-weight: 700;'>Partially Paid</span><br/>" +
                             $"<span style='font-size: 13px; color: #64748b;'>Paid: NPR {amountPaid:N2}<br/>Remaining: NPR {remainingAmount:N2}</span>";
            }
            else
            {
                statusHtml = $"<span style='color: #dc2626; font-weight: 700;'>Pending Payment</span><br/>" +
                             $"<span style='font-size: 13px; color: #64748b;'>Due: NPR {remainingAmount:N2}</span>";
            }

            var body = $@"
                <div style=""font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b;"">
                    <div style=""max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;"">
                        <div style=""background: linear-gradient(135deg, #475569 0%, #1e293b 100%); padding: 32px 24px; text-align: center;"">
                            <h1 style=""color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;"">VPSIMS ADMIN</h1>
                            <p style=""color: #cbd5e1; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;"">Invoice Distribution Nexus</p>
                        </div>
                        <div style=""padding: 40px 32px;"">
                            <h2 style=""color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 24px;"">Distribution Receipt & Invoice</h2>
                            
                            <div style=""background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #e2e8f0;"">
                                <table style=""width: 100%; border-collapse: collapse;"">
                                    <tr>
                                        <td style=""padding: 6px 0; font-size: 14px; color: #64748b; font-weight: 500;"">Invoice Reference</td>
                                        <td style=""padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;"">{invoiceNumber}</td>
                                    </tr>
                                    <tr>
                                        <td style=""padding: 6px 0; font-size: 14px; color: #64748b; font-weight: 500;"">Total Amount</td>
                                        <td style=""padding: 6px 0; font-size: 16px; color: #0f172a; font-weight: 800; text-align: right;"">NPR {totalAmount:N2}</td>
                                    </tr>
                                    <tr>
                                        <td style=""padding: 6px 0; font-size: 14px; color: #64748b; font-weight: 500; vertical-align: top;"">Payment Status</td>
                                        <td style=""padding: 6px 0; font-size: 14px; text-align: right; vertical-align: top;"">{statusHtml}</td>
                                    </tr>
                                </table>
                            </div>

                            <h3 style=""color: #0f172a; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; margin-top: 0;"">Items Summarized</h3>
                            <div style=""background-color: #f8fafc; border-left: 4px solid #475569; padding: 16px 20px; border-radius: 4px 12px 12px 4px; font-size: 15px; line-height: 1.6; color: #334155; font-weight: 500; margin-bottom: 32px;"">
                                {itemsSummary}
                            </div>

                            <p style=""font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 32px;"">
                                If you have any questions regarding this receipt or require assistance with dispatch and tracking, please contact our support desk.
                            </p>

                            <hr style=""border: none; border-top: 1px solid #f1f5f9; margin-bottom: 24px;"" />
                            <p style=""font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px;"">Thank you for choosing VPSIMS ADMIN,</p>
                            <p style=""font-size: 14px; color: #64748b; margin-top: 0;"">Logistics & Billing Team</p>
                        </div>
                        <div style=""background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; letter-spacing: 0.05em;"">
                            This is an automated system message. Please do not reply directly.
                        </div>
                    </div>
                </div>";

            await SendEmailAsync(to, subject, body);
        }

        public async Task SendBookingApprovalEmailAsync(string to, string customerName, DateTime serviceDate, string timeSlot, string branchName)
        {
            var subject = "Booking Confirmed - VPSIMS Professional Service";
            var body = $@"
                <div style='font-family: Segoe UI, Roboto, sans-serif; padding: 40px; background-color: #f8fafc; color: #1e293b;'>
                    <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);'>
                        <div style='background: #808080; padding: 24px; text-align: center;'>
                            <h1 style='color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;'>VPSIMS ADMIN</h1>
                        </div>
                        <div style='padding: 32px;'>
                            <h2 style='color: #1e293b; margin-top: 0;'>Great news, {customerName}!</h2>
                            <p style='font-size: 16px; line-height: 1.6;'>Your service booking has been <strong>officially approved</strong> by our distribution hub managers. We are preparing our tools and technicians for your arrival.</p>
                            
                            <div style='background: #eff6ff; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #dbeafe;'>
                                <p style='margin: 0; color: #1d4ed8; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;'>Appointment Details</p>
                                <div style='margin-top: 12px;'>
                                    <p style='margin: 4px 0;'>📅 <strong>Date:</strong> {serviceDate:MMMM dd, yyyy}</p>
                                    <p style='margin: 4px 0;'>⏰ <strong>Time:</strong> {timeSlot}</p>
                                    <p style='margin: 4px 0;'>📍 <strong>Location:</strong> {branchName} </p>
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

        public async Task SendPaymentReminderEmailAsync(string to, string invoiceNumber, decimal totalAmount, string itemsSummary, DateTime? dueDate)
        {
            var subject = $"Payment Reminder: Invoice {invoiceNumber} from VPSIMS";
            var dueDateFormatted = dueDate.HasValue ? dueDate.Value.ToString("dd MMM yyyy") : "Upon Receipt";

            var body = $@"
                <div style=""font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b;"">
                    <div style=""max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;"">
                        <div style=""background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 32px 24px; text-align: center;"">
                            <h1 style=""color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;"">VPSIMS ADMIN</h1>
                            <p style=""color: #e0f2fe; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;"">Friendly Payment Reminder</p>
                        </div>
                        <div style=""padding: 40px 32px;"">
                            <h2 style=""color: #0369a1; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 24px;"">Upcoming Payment Reminder</h2>
                            
                            <p style=""font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;"">
                                Hello,<br/><br/>
                                This is a friendly reminder that payment for invoice <strong>{invoiceNumber}</strong> is currently pending. Please see the payment details below:
                            </p>

                            <div style=""background-color: #f0f9ff; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #bae6fd;"">
                                <table style=""width: 100%; border-collapse: collapse;"">
                                    <tr>
                                        <td style=""padding: 6px 0; font-size: 14px; color: #0369a1; font-weight: 500;"">Invoice Reference</td>
                                        <td style=""padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;"">{invoiceNumber}</td>
                                    </tr>
                                    <tr>
                                        <td style=""padding: 6px 0; font-size: 14px; color: #0369a1; font-weight: 500;"">Amount Due</td>
                                        <td style=""padding: 6px 0; font-size: 16px; color: #0f172a; font-weight: 800; text-align: right;"">NPR {totalAmount:N2}</td>
                                    </tr>
                                    <tr>
                                        <td style=""padding: 6px 0; font-size: 14px; color: #0369a1; font-weight: 500;"">Due Date</td>
                                        <td style=""padding: 6px 0; font-size: 14px; color: #0f172a; font-weight: 700; text-align: right;"">{dueDateFormatted}</td>
                                    </tr>
                                </table>
                            </div>

                            <h3 style=""color: #0f172a; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; margin-top: 0;"">Items Purchased</h3>
                            <div style=""background-color: #f8fafc; border-left: 4px solid #0284c7; padding: 16px 20px; border-radius: 4px 12px 12px 4px; font-size: 15px; line-height: 1.6; color: #334155; font-weight: 500; margin-bottom: 32px;"">
                                {itemsSummary}
                            </div>

                            <p style=""font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 32px;"">
                                Please ensure payment is settled before the due date to avoid any late fees or delays in account services.
                            </p>

                            <hr style=""border: none; border-top: 1px solid #e2e8f0; margin-bottom: 24px;"" />
                            <p style=""font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px;"">Thank you for your business,</p>
                            <p style=""font-size: 14px; color: #64748b; margin-top: 0;"">Billing Department</p>
                        </div>
                        <div style=""background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; letter-spacing: 0.05em;"">
                            This is an automated system message. Please do not reply directly.
                        </div>
                    </div>
                </div>";

            await SendEmailAsync(to, subject, body);
        }

        public async Task SendOverdueNoticeEmailAsync(string to, string invoiceNumber, decimal overdueAmount, string itemsSummary, DateTime? dueDate)
        {
            var subject = $"⚠️ URGENT: Overdue Payment Notice - {invoiceNumber}";
            var dueDateFormatted = dueDate.HasValue ? dueDate.Value.ToString("dd MMM yyyy") : "N/A";

            var body = $@"
                <div style=""font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fef2f2; padding: 40px 20px; color: #1e293b;"">
                    <div style=""max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.05); border: 1px solid #fee2e2;"">
                        <div style=""background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%); padding: 32px 24px; text-align: center;"">
                            <h1 style=""color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;"">VPSIMS ADMIN</h1>
                            <p style=""color: #fecdd3; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;"">Payment Overdue Advisory</p>
                        </div>
                        <div style=""padding: 40px 32px;"">
                            <h2 style=""color: #991b1b; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 24px;"">Urgent: Action Required</h2>
                            
                            <p style=""font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;"">
                                Hello,<br/><br/>
                                Our records indicate that the payment deadline for invoice <strong>{invoiceNumber}</strong> has crossed. Please review the details below:
                            </p>

                            <div style=""background-color: #fff1f2; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #fecdd3;"">
                                <table style=""width: 100%; border-collapse: collapse;"">
                                    <tr>
                                        <td style=""padding: 6px 0; font-size: 14px; color: #9f1239; font-weight: 500;"">Invoice Reference</td>
                                        <td style=""padding: 6px 0; font-size: 14px; color: #991b1b; font-weight: 700; text-align: right;"">{invoiceNumber}</td>
                                    </tr>
                                    <tr>
                                        <td style=""padding: 6px 0; font-size: 14px; color: #9f1239; font-weight: 500;"">Total Overdue</td>
                                        <td style=""padding: 6px 0; font-size: 16px; color: #991b1b; font-weight: 800; text-align: right;"">NPR {overdueAmount:N2}</td>
                                    </tr>
                                    <tr>
                                        <td style=""padding: 6px 0; font-size: 14px; color: #9f1239; font-weight: 500;"">Due Date</td>
                                        <td style=""padding: 6px 0; font-size: 14px; color: #991b1b; font-weight: 700; text-align: right;"">{dueDateFormatted}</td>
                                    </tr>
                                </table>
                            </div>

                            <h3 style=""color: #0f172a; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; margin-top: 0;"">Items Ordered</h3>
                            <div style=""background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 4px 12px 12px 4px; font-size: 15px; line-height: 1.6; color: #334155; font-weight: 500; margin-bottom: 32px;"">
                                {itemsSummary}
                            </div>

                            <p style=""font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 32px;"">
                                Please settle the outstanding balance as soon as possible to avoid any disruptions in distribution and delivery services.
                            </p>

                            <hr style=""border: none; border-top: 1px solid #fecdd3; margin-bottom: 24px;"" />
                            <p style=""font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px;"">Thank you for your prompt attention,</p>
                            <p style=""font-size: 14px; color: #64748b; margin-top: 0;"">Accounts & Billing Operations</p>
                        </div>
                        <div style=""background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #fee2e2; letter-spacing: 0.05em;"">
                            This is an automated system message. Please do not reply directly.
                        </div>
                    </div>
                </div>";

            await SendEmailAsync(to, subject, body);
        }

        public async Task SendBookingRejectionEmailAsync(string to, string customerName, DateTime serviceDate, string reason)
        {
            var subject = "⚠️ Update Regarding Your Booking - VPSIMS Distribution Hub";
            var body = $@"
                <div style=""font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fef2f2; padding: 40px 20px; color: #1e293b;"">
                    <div style=""max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(239, 68, 68, 0.05); border: 1px solid #fee2e2;"">
                        <div style=""background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); padding: 32px 24px; text-align: center;"">
                            <h1 style=""color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;"">VPSIMS ADMIN</h1>
                            <p style=""color: #fecdd3; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;"">Booking Status Advisory</p>
                        </div>
                        <div style=""padding: 40px 32px;"">
                            <h2 style=""color: #991b1b; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 24px;"">Dear {customerName},</h2>
                            
                            <p style=""font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;"">
                                We are writing to inform you that your service booking requested for <strong>{serviceDate:MMMM dd, yyyy}</strong> could not be approved at this time.
                            </p>

                            <div style=""background-color: #fff1f2; border-radius: 12px; padding: 24px; margin-bottom: 32px; border: 1px solid #fecdd3;"">
                                <p style=""margin: 0; color: #be123c; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;"">Reason for System Rejection</p>
                                <p style=""margin-top: 12px; font-size: 15px; color: #4b5563; font-weight: 500; line-height: 1.5;"">{reason}</p>
                            </div>

                            <p style=""font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 32px;"">
                                You may attempt to request a different time slot through our portal, or contact our support staff for further assistance in coordinating your schedule.
                            </p>

                            <hr style=""border: none; border-top: 1px solid #fee2e2; margin-bottom: 24px;"" />
                            <p style=""font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px;"">Regards,</p>
                            <p style=""font-size: 14px; color: #64748b; margin-top: 0;"">Logistics Coordination Team</p>
                        </div>
                        <div style=""background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #fee2e2; letter-spacing: 0.05em;"">
                            This is an automated system message. Please do not reply directly.
                        </div>
                    </div>
                </div>";

            await SendEmailAsync(to, subject, body);
        }
    }
}
