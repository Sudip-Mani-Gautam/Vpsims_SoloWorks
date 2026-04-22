using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using vpsims.Data;
using vpsims.Interfaces;
using vpsims.Services;
using vpsims.Models;
using QuestPDF.Infrastructure;
using Hangfire;
using Hangfire.PostgreSql;

namespace vpsims
{
    public class Program
    {
        public static void Main(string[] args)
        {
            DotNetEnv.Env.Load();
            var builder = WebApplication.CreateBuilder(args);

            var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING") 
                                 ?? builder.Configuration.GetConnectionString("DefaultConnection");

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(connectionString));

            // ── Hangfire ──────────────────────────────────────────────────
            builder.Services.AddHangfire(config => config
                .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
                .UseSimpleAssemblyNameTypeSerializer()
                .UseRecommendedSerializerSettings()
                .UsePostgreSqlStorage(options => options.UseNpgsqlConnection(connectionString!)));

            builder.Services.AddHangfireServer();

            // ── JWT Authentication ────────────────────────────────────────
            var jwtSettings = builder.Configuration.GetSection("JwtSettings");
            var secret = jwtSettings["Secret"]!;

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = jwtSettings["Issuer"],
                        ValidAudience = jwtSettings["Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
                    };
                });

            builder.Services.AddAuthorization();

            // ── CORS ──────────────────────────────────────────────────────
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "http://localhost:8080", "http://localhost:8081")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            // ── Dependency Injection ──────────────────────────────────────
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<ICategoryService, CategoryService>();
            builder.Services.AddScoped<ISupplierService, SupplierService>();
            builder.Services.AddScoped<IPartService, PartService>();
            builder.Services.AddScoped<IOrderService, OrderService>();
            builder.Services.AddScoped<IBranchService, BranchService>();
            builder.Services.AddScoped<IVehicleService, VehicleService>();
            builder.Services.AddScoped<IBookingService, BookingService>();
            builder.Services.AddScoped<IEmailService, EmailService>();
            builder.Services.AddScoped<IPdfService, PdfService>();
            builder.Services.AddScoped<IPaymentService, PaymentService>();
            builder.Services.AddScoped<IStripeService, StripeService>();
            builder.Services.AddScoped<IPartRequestService, PartRequestService>();
            builder.Services.AddScoped<INotificationService, NotificationService>();
            builder.Services.AddScoped<ISupportService, SupportService>();
            builder.Services.AddScoped<IReviewService, ReviewService>();
            builder.Services.AddScoped<IActivityLogService, ActivityLogService>();
            builder.Services.AddScoped<BackgroundJobs>();

            // ── Controllers + Swagger ─────────────────────────────────────
            builder.Services.AddControllers()
                .AddJsonOptions(options => {
                    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
                });
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "VPSIMS API",
                    Version = "v1",
                    Description = "Vehicle Parts Selling & Inventory Management System"
                });

                // JWT support in Swagger UI
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter your JWT token below."
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            // ─────────────────────────────────────────────────────────────
            var app = builder.Build();

            // Configure QuestPDF
            QuestPDF.Settings.License = LicenseType.Community;

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "VPSIMS API v1");
                c.RoutePrefix = "swagger";
            });

            app.UseStaticFiles();
            app.UseCors("AllowFrontend");
            app.UseAuthentication();
            app.UseAuthorization();
            
            // Hangfire Dashboard (Admin Only ideally, but open for now)
            app.UseHangfireDashboard();
            
            // Schedule Overdue Invoices Scan (Daily)
            using (var scope = app.Services.CreateScope())
            {
                var recurringJobManager = scope.ServiceProvider.GetRequiredService<IRecurringJobManager>();
                recurringJobManager.AddOrUpdate<BackgroundJobs>(
                    "overdue-invoice-scan",
                    job => job.ProcessOverdueInvoices(),
                    Cron.Daily);
            }

            app.MapControllers();

            app.Run();
        }
    }
}
