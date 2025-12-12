using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentCharityHub.Models
{
    public class Donation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int StudentId { get; set; }

        [Required]
        public string DonorId { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(50)]
        public string PaymentMethod { get; set; } = string.Empty;

        [StringLength(200)]
        public string? TransactionId { get; set; }

        [StringLength(50)]
        public string Status { get; set; } = "Pending";

        public bool IsRecurring { get; set; } = false;
        public DateTime? NextRecurringDate { get; set; }
        [StringLength(500)]
        public string? ReceiptUrl { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        // Navigation properties
        [ForeignKey("StudentId")]
        public virtual Student Student { get; set; } = null!;

        [ForeignKey("DonorId")]
        public virtual ApplicationUser Donor { get; set; } = null!;

        public virtual ICollection<PaymentLog> PaymentLogs { get; set; } = new List<PaymentLog>();
    }
}

<<<<<<< HEAD

=======
>>>>>>> origin/GateraMe
