using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentCharityHub.Models
{
    public class Student
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ApplicationUserId { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public int Age { get; set; }

        [Required]
        [StringLength(500)]
        public string Location { get; set; } = string.Empty;

        [Required]
        [StringLength(2000)]
        public string Story { get; set; } = string.Empty;

        [StringLength(500)]
        public string? AcademicBackground { get; set; }

        [StringLength(200)]
        public string? DreamCareer { get; set; }

        [StringLength(500)]
        public string? PhotoUrl { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal FundingGoal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal AmountRaised { get; set; } = 0;

        public bool IsVisible { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("ApplicationUserId")]
        public virtual ApplicationUser ApplicationUser { get; set; } = null!;

        public virtual ICollection<Donation> Donations { get; set; } = new List<Donation>();
        public virtual ICollection<ProgressReport> ProgressReports { get; set; } = new List<ProgressReport>();
        public virtual ICollection<Follow> Follows { get; set; } = new List<Follow>(); // students they follow
        public virtual ICollection<Follow> Followers { get; set; } = new List<Follow>(); // students following them
        public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
        public virtual ICollection<PaymentLog> PaymentLogs { get; set; } = new List<PaymentLog>();
        public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
    }
}

