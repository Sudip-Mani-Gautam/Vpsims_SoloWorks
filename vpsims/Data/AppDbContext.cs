using Microsoft.EntityFrameworkCore;
using vpsims.Models;

namespace vpsims.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Part> Parts { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Branch> Branches { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ActivityLog> ActivityLogs { get; set; }
        public DbSet<PartRequest> PartRequests { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<BusinessPaymentDetail> BusinessPaymentDetails { get; set; }
        public DbSet<PaymentSubmission> PaymentSubmissions { get; set; }
        public DbSet<FAQ> FAQs { get; set; }
        public DbSet<SupportTicket> SupportTickets { get; set; }
        public DbSet<SupportMessage> SupportMessages { get; set; }
        public DbSet<SupportAttachment> SupportAttachments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Table names
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<Category>().ToTable("categories");
            modelBuilder.Entity<Supplier>().ToTable("suppliers");
            modelBuilder.Entity<Part>().ToTable("parts");
            modelBuilder.Entity<Order>().ToTable("orders");
            modelBuilder.Entity<OrderItem>().ToTable("order_items");
            modelBuilder.Entity<Branch>().ToTable("branches");
            modelBuilder.Entity<Vehicle>().ToTable("vehicles");
            modelBuilder.Entity<Booking>().ToTable("bookings");
            modelBuilder.Entity<Review>().ToTable("reviews");
            modelBuilder.Entity<ActivityLog>().ToTable("activity_logs");
            modelBuilder.Entity<PartRequest>().ToTable("part_requests");
            modelBuilder.Entity<Notification>().ToTable("notifications");
            modelBuilder.Entity<BusinessPaymentDetail>().ToTable("business_payment_details");
            modelBuilder.Entity<PaymentSubmission>().ToTable("payment_submissions");
            modelBuilder.Entity<FAQ>().ToTable("faqs");
            modelBuilder.Entity<SupportTicket>().ToTable("support_tickets");
            modelBuilder.Entity<SupportMessage>().ToTable("support_messages");
            modelBuilder.Entity<SupportAttachment>().ToTable("support_attachments");

            // Unique email
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Unique SKU
            modelBuilder.Entity<Part>()
                .HasIndex(p => p.SKU)
                .IsUnique();

            // Decimal precision
            modelBuilder.Entity<Part>()
                .Property(p => p.MarkedPrice)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Part>()
                .Property(p => p.SellingPrice)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalAmount)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.UnitPrice)
                .HasColumnType("decimal(18,2)");

            // Relationships
            modelBuilder.Entity<Part>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Parts)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Part>()
                .HasOne(p => p.Supplier)
                .WithMany(s => s.Parts)
                .HasForeignKey(p => p.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Part)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(oi => oi.PartId)
                .OnDelete(DeleteBehavior.Restrict);

            // New Relationships
            modelBuilder.Entity<Vehicle>()
                .HasOne(v => v.User)
                .WithMany(u => u.Vehicles)
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Branch)
                .WithMany(br => br.Bookings)
                .HasForeignKey(b => b.BranchId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Vehicle)
                .WithMany(v => v.Bookings)
                .HasForeignKey(b => b.VehicleId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ActivityLog>()
                .HasOne(a => a.User)
                .WithMany(u => u.ActivityLogs)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<PartRequest>()
                .HasOne(p => p.User)
                .WithMany(u => u.PartRequests)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PaymentSubmission>()
                .HasOne(p => p.User)
                .WithMany(u => u.PaymentSubmissions)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PaymentSubmission>()
                .HasOne(p => p.Order)
                .WithMany(o => o.PaymentSubmissions)
                .HasForeignKey(p => p.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PaymentSubmission>()
                .Property(p => p.AmountPaid)
                .HasColumnType("decimal(18,2)");

            // Support Ticket Relationships
            modelBuilder.Entity<SupportTicket>()
                .HasOne(s => s.User)
                .WithMany(u => u.SupportTickets)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SupportTicket>()
                .HasOne(s => s.AssignedStaff)
                .WithMany()
                .HasForeignKey(s => s.AssignedStaffId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<SupportMessage>()
                .HasOne(m => m.Ticket)
                .WithMany(t => t.Messages)
                .HasForeignKey(m => m.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SupportMessage>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SupportAttachment>()
                .HasOne(a => a.SupportMessage)
                .WithMany(m => m.Attachments)
                .HasForeignKey(a => a.SupportMessageId)
                .OnDelete(DeleteBehavior.Cascade);

            // Seed Exactly 2 Administrators (Using static hash for stable migrations)
            var staticHash = "$2a$11$gkTiMazXgyVznv1jTAKbgemylmSgS8JoPufrwhfjfet5yeU7GKRwu"; // Verified BCrypt hash for "Admin123@"
            var seedDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Name = "VPSIMS ADMIN",
                    Email = "admin1@gmail.com",
                    PasswordHash = staticHash,
                    Role = "Admin",
                    IsActive = true,
                    CreatedAt = seedDate
                },
                new User
                {
                    Id = 2,
                    Name = "VPSIMS Admin 2",
                    Email = "admin2@gmail.com",
                    PasswordHash = staticHash,
                    Role = "Admin",
                    IsActive = true,
                    CreatedAt = seedDate
                }
            );

            // Seed Initial FAQs
            modelBuilder.Entity<FAQ>().HasData(
                new FAQ { Id = 1, Question = "How do I create a service appointment?", Answer = "Navigate to the 'Book Appointment' section from your dashboard, select your vehicle, choose a service type and date, and submit. You will receive a notification once our staff approves it.", Category = "Bookings", DisplayOrder = 1, IsPublished = true, HexColor = "Purple" },
                new FAQ { Id = 2, Question = "What is the 'Loyalty Points' system?", Answer = "For every purchase and service completed, you earn loyalty points. These points can be redeemed for discounts on future parts or services. You can view your balance in your profile.", Category = "Rewards", DisplayOrder = 2, IsPublished = true, HexColor = "Yellow" },
                new FAQ { Id = 3, Question = "How can I request a part that is not in stock?", Answer = "Use the 'Request Parts' feature. Provide the part name, description, and your vehicle details. Our procurement team will find it for you and provide a quote.", Category = "Parts", DisplayOrder = 3, IsPublished = true, HexColor = "Green" },
                new FAQ { Id = 4, Question = "Is there a warranty on the parts purchased?", Answer = "Yes, all our genuine parts come with a manufacturer's warranty. The duration depends on the specific part and brand. Please keep your invoice for any warranty claims.", Category = "Policies", DisplayOrder = 4, IsPublished = true, HexColor = "Red" }
            );

            // Seed Initial Branch
            modelBuilder.Entity<Branch>().HasData(
                new Branch { Id = 1, Name = "Main Service Center", Address = "123 Auto Lane", Phone = "555-0100", Latitude = 40.7128, Longitude = -74.0060, IsActive = true }
            );
        }
    }
}
