using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentCharityHub.Models
{
    public enum ApplicationStatus
    {
        Pending,
        UnderReview,
        Approved,
        Rejected,
        Incomplete
    }

    public class StudentApplication
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ApplicationUserId { get; set; } = string.Empty;

        // Personal Information
        [Required]
        [StringLength(200)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        public int Age { get; set; }

        [Required]
        [StringLength(200)]
        public string PlaceOfBirth { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string CurrentResidency { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(200)]
        public string Email { get; set; } = string.Empty;

        [Phone]
        [StringLength(20)]
        public string? PhoneNumber { get; set; }

        // Family Information
        [Required]
        [StringLength(200)]
        public string FatherName { get; set; } = string.Empty;

        [Required]
        [StringLength(200)]
        public string MotherName { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal ParentsAnnualSalary { get; set; }

        [StringLength(1000)]
        public string? FamilySituation { get; set; }

        // Academic Information
        [Required]
        [StringLength(2000)]
        public string PersonalStory { get; set; } = string.Empty;

        [Required]
        [StringLength(1000)]
        public string AcademicBackground { get; set; } = string.Empty;

        [StringLength(200)]
        public string? CurrentEducationLevel { get; set; }

        [StringLength(200)]
        public string? FieldOfStudy { get; set; }

        [StringLength(200)]
        public string? DreamCareer { get; set; }

        // Documents
        [StringLength(500)]
        public string? ProfileImageUrl { get; set; }

        [StringLength(2000)]
        public string? ProofDocuments { get; set; } // JSON array of document URLs

        [StringLength(5000)]
        public string? GalleryImages { get; set; } // JSON array of gallery image URLs

        // Funding Information
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal RequestedFundingAmount { get; set; }

        [StringLength(1000)]
        public string? FundingPurpose { get; set; }

        // Application Status
        [Required]
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;

        [StringLength(1000)]
        public string? RejectionReason { get; set; }

        // Workflow Tracking
        public string? ReviewedByManagerId { get; set; }
        public DateTime? ReviewedByManagerAt { get; set; }

        public string? ApprovedByAdminId { get; set; }
        public DateTime? ApprovedByAdminAt { get; set; }

        public bool IsPostedAsStudent { get; set; } = false;
        public int? StudentId { get; set; } // Link to Student if approved and posted

        // Timestamps
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("ApplicationUserId")]
        public virtual ApplicationUser ApplicationUser { get; set; } = null!;

        [ForeignKey("ReviewedByManagerId")]
        public virtual ApplicationUser? ReviewedByManager { get; set; }

        [ForeignKey("ApprovedByAdminId")]
        public virtual ApplicationUser? ApprovedByAdmin { get; set; }

        [ForeignKey("StudentId")]
        public virtual Student? Student { get; set; }
    }
}
