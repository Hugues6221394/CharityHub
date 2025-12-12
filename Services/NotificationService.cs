using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using StudentCharityHub.Models;
using StudentCharityHub.Repositories;
using StudentCharityHub.Hubs;
using SendGrid;
using SendGrid.Helpers.Mail;

namespace StudentCharityHub.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly ILogger<NotificationService> _logger;
        private readonly IHubContext<NotificationHub> _notificationHub;
        private readonly UserManager<ApplicationUser> _userManager;

        public NotificationService(
            IUnitOfWork unitOfWork,
            IConfiguration configuration,
            ILogger<NotificationService> logger,
            IHubContext<NotificationHub> notificationHub,
            UserManager<ApplicationUser> userManager)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _logger = logger;
            _notificationHub = notificationHub;
            _userManager = userManager;
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

                // Send real-time notification via SignalR
                await _notificationHub.Clients.Group($"user_{userId}").SendAsync("ReceiveNotification", new
                {
                    notification.Id,
                    notification.Title,
                    notification.Message,
                    notification.Type,
                    notification.LinkUrl,
                    notification.CreatedAt,
                    IsRead = false
                });
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
                var apiKey = _configuration["SendGrid:ApiKey"];
                var fromEmail = _configuration["SendGrid:FromEmail"];
                var fromName = _configuration["SendGrid:FromName"];

                if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(fromEmail))
                {
                    _logger.LogWarning("SendGrid configuration is missing. Email not sent to {Email}", email);
                    return;
                }

                var client = new SendGridClient(apiKey);
                var msg = new SendGridMessage
                {
                    From = new EmailAddress(fromEmail, fromName),
                    Subject = subject,
                    PlainTextContent = body,
                    HtmlContent = body.Replace("\n", "<br>")
                };
                msg.AddTo(new EmailAddress(email));

                var response = await client.SendEmailAsync(msg);
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("Email sent successfully to {Email}: {Subject}", email, subject);
                }
                else
                {
                    var responseBody = await response.Body.ReadAsStringAsync();
                    _logger.LogError("Failed to send email to {Email}. Status: {Status}, Body: {Body}", 
                        email, response.StatusCode, responseBody);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email notification to {Email}", email);
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
                    var linkUrl = $"/students/{studentId}/progress/{progressReport.Id}";
                    
                    await SendNotificationAsync(
                        donorId,
                        "New Progress Update",
                        $"{student.FullName} has posted a new progress update: {progressReport.Title}",
                        "Info",
                        linkUrl
                    );

                    // Send email notification
                    var donor = await _userManager.FindByIdAsync(donorId);
                    if (donor != null && !string.IsNullOrEmpty(donor.Email))
                    {
                        var emailSubject = "New Progress Update from Your Sponsored Student";
                        var emailBody = $"Hello {donor.FirstName},\n\n" +
                                      $"{student.FullName} has posted a new progress update: {progressReport.Title}\n\n" +
                                      $"{progressReport.Description}\n\n" +
                                      $"View the full update: {linkUrl}\n\n" +
                                      $"Best regards,\nStudent Charity Hub Team";
                        await SendEmailNotificationAsync(donor.Email, emailSubject, emailBody);
                    }
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

                // Send email notification
                var donor = await _userManager.FindByIdAsync(donation.DonorId);
                if (donor != null && !string.IsNullOrEmpty(donor.Email))
                {
                    var emailSubject = "Donation Confirmed";
                    var emailBody = $"Hello {donor.FirstName},\n\n" +
                                  $"Your donation of ${donation.Amount:F2} to {student?.FullName} has been confirmed.\n\n" +
                                  $"Thank you for your generous support!\n\n" +
                                  $"Best regards,\nStudent Charity Hub Team";
                    await SendEmailNotificationAsync(donor.Email, emailSubject, emailBody);
                }
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

