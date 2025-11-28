using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using StudentCharityHub.Models;
using StudentCharityHub.Repositories;
using StudentCharityHub.Services;
using System.Security.Claims;

namespace StudentCharityHub.Controllers
{
    [Authorize]
    public class MessagesController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly INotificationService _notificationService;
        private readonly ILogger<MessagesController> _logger;

        public MessagesController(
            IUnitOfWork unitOfWork,
            UserManager<ApplicationUser> userManager,
            INotificationService notificationService,
            ILogger<MessagesController> logger)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _notificationService = notificationService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return RedirectToAction("Login", "Account");

            var sentMessages = await _unitOfWork.Messages.FindAsync(m => m.SenderId == userId);
            var receivedMessages = await _unitOfWork.Messages.FindAsync(m => m.ReceiverId == userId);

            ViewBag.SentMessages = sentMessages.OrderByDescending(m => m.CreatedAt).ToList();
            ViewBag.ReceivedMessages = receivedMessages.OrderByDescending(m => m.CreatedAt).ToList();

            return View();
        }

        [HttpGet]
        public async Task<IActionResult> Create(int studentId)
        {
            // Only donors can initiate messages
            if (!User.IsInRole("Donor"))
            {
                return Forbid();
            }

            var student = await _unitOfWork.Students.GetByIdAsync(studentId);
            if (student == null)
            {
                return NotFound();
            }

            ViewBag.Student = student;
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Donor")]
        public async Task<IActionResult> Create(Message message)
        {
            if (ModelState.IsValid)
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (userId == null) return RedirectToAction("Login", "Account");

                message.SenderId = userId;
                message.IsRead = false;
                message.IsModerated = false;
                message.IsApproved = false;
                message.CreatedAt = DateTime.UtcNow;

                // Get student's user ID
                var student = await _unitOfWork.Students.GetByIdAsync(message.StudentId);
                if (student != null)
                {
                    message.ReceiverId = student.ApplicationUserId;
                }

                await _unitOfWork.Messages.AddAsync(message);
                await _unitOfWork.SaveChangesAsync();

                // Send notification
                if (!string.IsNullOrEmpty(message.ReceiverId))
                {
                    await _notificationService.NotifyNewMessageAsync(message.ReceiverId, message);
                }

                TempData["SuccessMessage"] = "Message sent. It will be reviewed by admin before delivery.";
                return RedirectToAction("Index");
            }

            ViewBag.Student = await _unitOfWork.Students.GetByIdAsync(message.StudentId);
            return View(message);
        }

        [HttpGet]
        public async Task<IActionResult> Reply(int messageId)
        {
            var originalMessage = await _unitOfWork.Messages.GetByIdAsync(messageId);
            if (originalMessage == null)
            {
                return NotFound();
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (originalMessage.ReceiverId != userId && originalMessage.SenderId != userId)
            {
                return Forbid();
            }

            ViewBag.OriginalMessage = originalMessage;
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Reply(int messageId, Message reply)
        {
            var originalMessage = await _unitOfWork.Messages.GetByIdAsync(messageId);
            if (originalMessage == null)
            {
                return NotFound();
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (originalMessage.ReceiverId != userId && originalMessage.SenderId != userId)
            {
                return Forbid();
            }

            if (ModelState.IsValid)
            {
                reply.SenderId = userId;
                reply.ReceiverId = originalMessage.SenderId == userId ? originalMessage.ReceiverId : originalMessage.SenderId;
                reply.StudentId = originalMessage.StudentId;
                reply.IsRead = false;
                reply.IsModerated = false;
                reply.IsApproved = false;
                reply.CreatedAt = DateTime.UtcNow;

                await _unitOfWork.Messages.AddAsync(reply);
                await _unitOfWork.SaveChangesAsync();

                // Send notification
                await _notificationService.NotifyNewMessageAsync(reply.ReceiverId, reply);

                TempData["SuccessMessage"] = "Reply sent. It will be reviewed by admin before delivery.";
                return RedirectToAction("Details", new { id = messageId });
            }

            ViewBag.OriginalMessage = originalMessage;
            return View(reply);
        }

        [HttpGet]
        public async Task<IActionResult> Details(int id)
        {
            var message = await _unitOfWork.Messages.GetByIdAsync(id);
            if (message == null)
            {
                return NotFound();
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (message.SenderId != userId && message.ReceiverId != userId && !User.IsInRole("Admin"))
            {
                return Forbid();
            }

            // Mark as read if receiver
            if (message.ReceiverId == userId && !message.IsRead)
            {
                message.IsRead = true;
                message.ReadAt = DateTime.UtcNow;
                _unitOfWork.Messages.Update(message);
                await _unitOfWork.SaveChangesAsync();
            }

            return View(message);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> Moderate()
        {
            var messages = await _unitOfWork.Messages.FindAsync(m => !m.IsModerated);
            return View(messages.OrderByDescending(m => m.CreatedAt).ToList());
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ApproveMessage(int id)
        {
            var message = await _unitOfWork.Messages.GetByIdAsync(id);
            if (message == null)
            {
                return NotFound();
            }

            message.IsModerated = true;
            message.IsApproved = true;
            _unitOfWork.Messages.Update(message);
            await _unitOfWork.SaveChangesAsync();

            TempData["SuccessMessage"] = "Message approved.";
            return RedirectToAction("Moderate");
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RejectMessage(int id, string? moderatorNotes)
        {
            var message = await _unitOfWork.Messages.GetByIdAsync(id);
            if (message == null)
            {
                return NotFound();
            }

            message.IsModerated = true;
            message.IsApproved = false;
            message.ModeratorNotes = moderatorNotes;
            _unitOfWork.Messages.Update(message);
            await _unitOfWork.SaveChangesAsync();

            TempData["SuccessMessage"] = "Message rejected.";
            return RedirectToAction("Moderate");
        }
    }
}


