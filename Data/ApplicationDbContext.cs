using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StudentCharityHub.Models;

namespace StudentCharityHub.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<Student> Students { get; set; }
        public DbSet<Donation> Donations { get; set; }
        public DbSet<ProgressReport> ProgressReports { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Follow> Follows { get; set; }
        public DbSet<PaymentLog> PaymentLogs { get; set; }
        public DbSet<Document> Documents { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Student
            builder.Entity<Student>(entity =>
            {
                entity.HasIndex(e => e.ApplicationUserId).IsUnique();
                entity.Property(e => e.FundingGoal).HasPrecision(18, 2);
                entity.Property(e => e.AmountRaised).HasPrecision(18, 2);
            });

            // Donation
            builder.Entity<Donation>(entity =>
            {
                entity.Property(d => d.Amount).HasPrecision(18, 2);
                entity.HasIndex(d => d.TransactionId);

                entity.HasOne(d => d.Student)
                      .WithMany(s => s.Donations)
                      .HasForeignKey(d => d.StudentId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(d => d.Donor)
                      .WithMany(u => u.Donations)
                      .HasForeignKey(d => d.DonorId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // PaymentLog
            builder.Entity<PaymentLog>(entity =>
            {
                entity.Property(p => p.Amount).HasPrecision(18, 2);
                entity.HasIndex(p => p.TransactionId);

                entity.HasOne(p => p.Student)
                      .WithMany(s => s.PaymentLogs)
                      .HasForeignKey(p => p.StudentId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(p => p.Donation)
                      .WithMany(d => d.PaymentLogs)
                      .HasForeignKey(p => p.DonationId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Follow
            builder.Entity<Follow>(entity =>
            {
                entity.HasIndex(f => new { f.DonorId, f.StudentId }).IsUnique();

                entity.HasOne(f => f.Donor)
                      .WithMany(u => u.Follows)
                      .HasForeignKey(f => f.DonorId)
                      .OnDelete(DeleteBehavior.Restrict); // <- IMPORTANT

                entity.HasOne(f => f.Student)
                      .WithMany(s => s.Followers)
                      .HasForeignKey(f => f.StudentId)
                      .OnDelete(DeleteBehavior.Restrict); // <- IMPORTANT
            });


            // Message
            builder.Entity<Message>(entity =>
            {
                entity.HasKey(m => m.Id);

                entity.HasOne(m => m.Sender)
                      .WithMany(u => u.SentMessages)
                      .HasForeignKey(m => m.SenderId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.Receiver)
                      .WithMany(u => u.ReceivedMessages)
                      .HasForeignKey(m => m.ReceiverId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(m => m.Student)
                      .WithMany(s => s.Messages)
                      .HasForeignKey(m => m.StudentId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(m => new { m.SenderId, m.ReceiverId });
            });
        }
    }
}

