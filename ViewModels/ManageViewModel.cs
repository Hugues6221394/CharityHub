using System.ComponentModel.DataAnnotations;

namespace StudentCharityHub.ViewModels
{
    public class ManageViewModel
    {
        [Required]
        [StringLength(100)]
        [Display(Name = "First Name")]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        [Display(Name = "Last Name")]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [Display(Name = "Email")]
        public string Email { get; set; } = string.Empty;

        [Phone]
        [Display(Name = "Phone number")]
        public string? PhoneNumber { get; set; }

        public bool TwoFactorEnabled { get; set; }
        public bool HasAuthenticator { get; set; }
    }
}



