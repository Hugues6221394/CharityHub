using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using StudentCharityHub.Models;
using StudentCharityHub.Repositories;
using System.Security.Claims;

namespace StudentCharityHub.Controllers
{
    [Authorize(Roles = "Donor")]
    public class DonorController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<DonorController> _logger;

        public DonorController(
            IUnitOfWork unitOfWork,
            UserManager<ApplicationUser> userManager,
            ILogger<DonorController> logger)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return RedirectToAction("Login", "Account");

            var donations = await _unitOfWork.Donations.FindAsync(d => d.DonorId == userId && d.Status == "Completed");
            var follows = await _unitOfWork.Follows.FindAsync(f => f.DonorId == userId);

            var totalDonated = donations.Sum(d => d.Amount);
            var sponsoredStudents = donations.Select(d => d.StudentId).Distinct().Count();

            ViewBag.TotalDonated = totalDonated;
            ViewBag.SponsoredStudents = sponsoredStudents;
            ViewBag.RecentDonations = donations.OrderByDescending(d => d.CreatedAt).Take(5).ToList();
            ViewBag.FollowedStudents = follows.ToList();

            // Get progress updates for followed students
            var studentIds = follows.Select(f => f.StudentId).ToList();
            var progressUpdates = new List<ProgressReport>();
            foreach (var studentId in studentIds)
            {
                var reports = await _unitOfWork.ProgressReports.FindAsync(pr => pr.StudentId == studentId);
                progressUpdates.AddRange(reports);
            }
            ViewBag.ProgressUpdates = progressUpdates.OrderByDescending(pr => pr.ReportDate).Take(10).ToList();

            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Follow(int studentId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return RedirectToAction("Login", "Account");

            // Check if already following
            var existingFollow = await _unitOfWork.Follows.FirstOrDefaultAsync(
                f => f.DonorId == userId && f.StudentId == studentId);

            if (existingFollow == null)
            {
                var follow = new Follow
                {
                    DonorId = userId,
                    StudentId = studentId,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Follows.AddAsync(follow);
                await _unitOfWork.SaveChangesAsync();

                TempData["SuccessMessage"] = "You are now following this student.";
            }
            else
            {
                TempData["InfoMessage"] = "You are already following this student.";
            }

            return RedirectToAction("Details", "Student", new { id = studentId });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Unfollow(int studentId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return RedirectToAction("Login", "Account");

            var follow = await _unitOfWork.Follows.FirstOrDefaultAsync(
                f => f.DonorId == userId && f.StudentId == studentId);

            if (follow != null)
            {
                _unitOfWork.Follows.Remove(follow);
                await _unitOfWork.SaveChangesAsync();

                TempData["SuccessMessage"] = "You have unfollowed this student.";
            }

            return RedirectToAction("Details", "Student", new { id = studentId });
        }

        [HttpGet]
        public async Task<IActionResult> MySponsoredStudents()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return RedirectToAction("Login", "Account");

            var donations = await _unitOfWork.Donations.FindAsync(d => d.DonorId == userId && d.Status == "Completed");
            var studentIds = donations.Select(d => d.StudentId).Distinct().ToList();
            var students = new List<Student>();

            foreach (var studentId in studentIds)
            {
                var student = await _unitOfWork.Students.GetByIdAsync(studentId);
                if (student != null)
                {
                    students.Add(student);
                }
            }

            return View(students);
        }
    }
}


