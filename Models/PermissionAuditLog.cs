using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentCharityHub.Models
{
    public class PermissionAuditLog
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string AdminUserId { get; set; } = string.Empty;

        [ForeignKey("AdminUserId")]
        public virtual ApplicationUser AdminUser { get; set; } = null!;

        [Required]
        public string TargetUserId { get; set; } = string.Empty;

        [ForeignKey("TargetUserId")]
        public virtual ApplicationUser TargetUser { get; set; } = null!;

        [Required]
        public string Changes { get; set; } = string.Empty; // e.g., Added: a,b Removed: c

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

