using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentCharityHub.Models
{
    public class Follow
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string DonorId { get; set; } = string.Empty;

        [Required]
        public int StudentId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("DonorId")]
        public virtual ApplicationUser Donor { get; set; } = null!;

        [ForeignKey("StudentId")]
        public virtual Student Student { get; set; } = null!;
    }
}

<<<<<<< HEAD

=======
>>>>>>> origin/GateraMe
