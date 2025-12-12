using System.ComponentModel.DataAnnotations;

namespace StudentCharityHub.ViewModels
{
    public class SendMessageViewModel
    {
        [Required]
        public int StudentId { get; set; }

        [Required]
        [StringLength(1000)]
        [Display(Name = "Message")]
        public string Content { get; set; } = string.Empty;
    }
}

