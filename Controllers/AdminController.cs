using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentCharityHub.Models;
using StudentCharityHub.Repositories;
using System.Security.Claims;

namespace StudentCharityHub.Controllers
{
    [Authorize(Roles = "Admin")]
    public class AdminController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<AdminController> _logger;

        public AdminController(
            IUnitOfWork unitOfWork,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ILogger<AdminController> logger)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        public async Task<IActionResult> Index()
        {
            var students = await _unitOfWork.Students.GetAllAsync();
            var donations = await _unitOfWork.Donations.GetAllAsync();
            var users = _userManager.Users.ToList();

            ViewBag.TotalStudents = students.Count();
            ViewBag.TotalDonations = donations.Count();
            ViewBag.TotalAmount = donations.Where(d => d.Status == "Completed").Sum(d => d.Amount);
            ViewBag.TotalUsers = users.Count();
            ViewBag.RecentDonations = donations.OrderByDescending(d => d.CreatedAt).Take(10).ToList();
            ViewBag.RecentStudents = students.OrderByDescending(s => s.CreatedAt).Take(5).ToList();

            return View();
        }

        [HttpGet]
        public async Task<IActionResult> Users()
        {
            var users = _userManager.Users.ToList();
            var usersWithRoles = new List<dynamic>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                usersWithRoles.Add(new
                {
                    User = user,
                    Roles = roles
                });
            }

            return View(usersWithRoles);
        }

        [HttpGet]
        public async Task<IActionResult> EditUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var roles = await _userManager.GetRolesAsync(user);
            ViewBag.AllRoles = _roleManager.Roles.Select(r => r.Name).ToList();
            ViewBag.UserRoles = roles;

            return View(user);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> EditUser(string id, ApplicationUser user, List<string>? roles)
        {
            if (id != user.Id)
            {
                return NotFound();
            }

            var existingUser = await _userManager.FindByIdAsync(id);
            if (existingUser == null)
            {
                return NotFound();
            }

            existingUser.FirstName = user.FirstName;
            existingUser.LastName = user.LastName;
            existingUser.Email = user.Email;
            existingUser.PhoneNumber = user.PhoneNumber;
            existingUser.IsActive = user.IsActive;

            var result = await _userManager.UpdateAsync(existingUser);
            if (result.Succeeded && roles != null)
            {
                var currentRoles = await _userManager.GetRolesAsync(existingUser);
                await _userManager.RemoveFromRolesAsync(existingUser, currentRoles);
                await _userManager.AddToRolesAsync(existingUser, roles);
            }

            TempData["SuccessMessage"] = "User updated successfully.";
            return RedirectToAction("Users");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            user.IsActive = false;
            user.IsDeactivated = true;
            user.DeactivatedAt = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            TempData["SuccessMessage"] = "User deactivated successfully.";
            return RedirectToAction("Users");
        }

        [HttpGet]
        public async Task<IActionResult> Students()
        {
            var students = await _unitOfWork.Students.GetAllAsync();
            return View(students.OrderByDescending(s => s.CreatedAt).ToList());
        }

        [HttpGet]
        public async Task<IActionResult> Donations()
        {
            var donations = await _unitOfWork.Donations.GetAllAsync();
            return View(donations.OrderByDescending(d => d.CreatedAt).ToList());
        }

        [HttpGet]
        public async Task<IActionResult> ProgressReports()
        {
            var reports = await _unitOfWork.ProgressReports.GetAllAsync();
            return View(reports.OrderByDescending(r => r.ReportDate).ToList());
        }

        [HttpGet]
        public IActionResult CreateProgressReport(int studentId)
        {
            ViewBag.StudentId = studentId;
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateProgressReport(ProgressReport report, IFormFile? photo, IFormFile? video)
        {
            if (ModelState.IsValid)
            {
                // Handle file uploads
                if (photo != null && photo.Length > 0)
                {
                    var photoPath = await SaveFileAsync(photo, "images");
                    report.PhotoUrl = photoPath;
                }

                if (video != null && video.Length > 0)
                {
                    var videoPath = await SaveFileAsync(video, "videos");
                    report.VideoUrl = videoPath;
                }

                report.CreatedAt = DateTime.UtcNow;
                report.ReportDate = DateTime.UtcNow;

                await _unitOfWork.ProgressReports.AddAsync(report);
                await _unitOfWork.SaveChangesAsync();

                // Send notifications to donors
                // This will be handled by a background service or called directly
                // await _notificationService.NotifyDonorsOfProgressUpdateAsync(report.StudentId, report);

                TempData["SuccessMessage"] = "Progress report created successfully.";
                return RedirectToAction("ProgressReports");
            }

            ViewBag.StudentId = report.StudentId;
            return View(report);
        }

        [HttpGet]
        public async Task<IActionResult> EditProgressReport(int id)
        {
            var report = await _unitOfWork.ProgressReports.GetByIdAsync(id);
            if (report == null)
            {
                return NotFound();
            }

            return View(report);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> EditProgressReport(int id, ProgressReport report, IFormFile? photo, IFormFile? video)
        {
            if (id != report.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                var existingReport = await _unitOfWork.ProgressReports.GetByIdAsync(id);
                if (existingReport == null)
                {
                    return NotFound();
                }

                if (photo != null && photo.Length > 0)
                {
                    var photoPath = await SaveFileAsync(photo, "images");
                    existingReport.PhotoUrl = photoPath;
                }

                if (video != null && video.Length > 0)
                {
                    var videoPath = await SaveFileAsync(video, "videos");
                    existingReport.VideoUrl = videoPath;
                }

                existingReport.Title = report.Title;
                existingReport.Description = report.Description;
                existingReport.Grade = report.Grade;
                existingReport.Achievement = report.Achievement;
                existingReport.ReportDate = report.ReportDate;

                _unitOfWork.ProgressReports.Update(existingReport);
                await _unitOfWork.SaveChangesAsync();

                TempData["SuccessMessage"] = "Progress report updated successfully.";
                return RedirectToAction("ProgressReports");
            }

            return View(report);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteProgressReport(int id)
        {
            var report = await _unitOfWork.ProgressReports.GetByIdAsync(id);
            if (report == null)
            {
                return NotFound();
            }

            _unitOfWork.ProgressReports.Remove(report);
            await _unitOfWork.SaveChangesAsync();

            TempData["SuccessMessage"] = "Progress report deleted successfully.";
            return RedirectToAction("ProgressReports");
        }

        private async Task<string> SaveFileAsync(IFormFile file, string folder)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", folder);
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            return $"/{folder}/{uniqueFileName}";
        }
    }
}


