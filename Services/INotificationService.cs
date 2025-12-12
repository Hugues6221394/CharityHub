using StudentCharityHub.Models;

namespace StudentCharityHub.Services
{
    public interface INotificationService
    {
        Task SendNotificationAsync(string userId, string title, string message, string type = "Info", string? linkUrl = null);
        Task SendEmailNotificationAsync(string email, string subject, string body);
        Task NotifyDonorsOfProgressUpdateAsync(int studentId, ProgressReport progressReport);
        Task NotifyDonationConfirmationAsync(Donation donation);
        Task NotifyNewFollowAsync(string donorId, int studentId);
        Task NotifyNewMessageAsync(string receiverId, Message message);
    }
}



