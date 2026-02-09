using Microsoft.Extensions.Configuration;
using StudentCharityHub.Models;
using StudentCharityHub.Repositories;

namespace StudentCharityHub.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            ILogger<NotificationService> logger)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendNotificationAsync(string userId, string title, string message, string type = "Info", string? linkUrl = null)
        {
            try
            {
                var notification = new Notification
                {
                    UserId = userId,
                    Title = title,
                    Message = message,
                    Type = type,
                    LinkUrl = linkUrl,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Notifications.AddAsync(notification);
                await _unitOfWork.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notification");
            }
        }

        public async Task SendEmailNotificationAsync(string email, string subject, string body)
        {
            try
            {
                // SendGrid integration stub
                var apiKey = _configuration["SendGrid:ApiKey"];
                var fromEmail = _configuration["SendGrid:FromEmail"];
                var fromName = _configuration["SendGrid:FromName"];

                // In production, use SendGrid SDK
                // var client = new SendGridClient(apiKey);
                // var msg = new SendGridMessage
                // {
                //     From = new EmailAddress(fromEmail, fromName),
                //     Subject = subject,
                //     PlainTextContent = body,
                //     HtmlContent = body
                // };
                // msg.AddTo(new EmailAddress(email));
                // await client.SendEmailAsync(msg);

                _logger.LogInformation($"Email sent to {email}: {subject}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email notification");
            }
        }

        public async Task NotifyDonorsOfProgressUpdateAsync(int studentId, ProgressReport progressReport)
        {
            try
            {
                var student = await _unitOfWork.Students.GetByIdAsync(studentId);
                if (student == null) return;

                var donations = await _unitOfWork.Donations.FindAsync(d => d.StudentId == studentId && d.Status == "Completed");
                var donorIds = donations.Select(d => d.DonorId).Distinct().ToList();

                foreach (var donorId in donorIds)
                {
                    await SendNotificationAsync(
                        donorId,
                        "New Progress Update",
                        $"{student.FullName} has posted a new progress update: {progressReport.Title}",
                        "Info",
                        $"/students/{studentId}/progress/{progressReport.Id}"
                    );

                    // Send email notification
                    // Note: In production, inject UserManager to get user email
                    // For now, this is a stub
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying donors of progress update");
            }
        }

        public async Task NotifyDonationConfirmationAsync(Donation donation)
        {
            try
            {
                var student = await _unitOfWork.Students.GetByIdAsync(donation.StudentId);

                await SendNotificationAsync(
                    donation.DonorId,
                    "Donation Confirmed",
                    $"Your donation of ${donation.Amount:F2} to {student?.FullName} has been confirmed.",
                    "Success",
                    $"/donations/{donation.Id}"
                );

                // Note: In production, inject UserManager to get user email for email notification
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending donation confirmation");
            }
        }

        public async Task NotifyNewFollowAsync(string donorId, int studentId)
        {
            try
            {
                var student = await _unitOfWork.Students.GetByIdAsync(studentId);
                if (student != null)
                {
                    await SendNotificationAsync(
                        student.ApplicationUserId,
                        "New Follower",
                        "A donor has started following your progress.",
                        "Info",
                        $"/students/{studentId}"
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending new follow notification");
            }
        }

        public async Task NotifyNewMessageAsync(string receiverId, Message message)
        {
            try
            {
                await SendNotificationAsync(
                    receiverId,
                    "New Message",
                    "You have received a new message.",
                    "Info",
                    $"/Messages/Details/{message.Id}"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending new message notification");
            }
        }
    }
}

