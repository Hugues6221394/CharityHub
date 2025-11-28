using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using StudentCharityHub.Models;
using StudentCharityHub.Repositories;
using StudentCharityHub.Services;
using System.Security.Claims;

namespace StudentCharityHub.Controllers
{
    [Authorize(Roles = "Admin,Student")]
    public class StudentController : Controller
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<StudentController> _logger;

        public StudentController(
            IUnitOfWork unitOfWork,
            UserManager<ApplicationUser> userManager,
            IWebHostEnvironment environment,
            ILogger<StudentController> logger)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _environment = environment;
            _logger = logger;
        }

        [AllowAnonymous]
        public async Task<IActionResult> Index()
        {
            var students = await _unitOfWork.Students.FindAsync(s => s.IsVisible);
            return View(students.OrderByDescending(s => s.CreatedAt).ToList());
        }

        [AllowAnonymous]
        public async Task<IActionResult> Details(int id)
        {
            var student = await _unitOfWork.Students.GetByIdAsync(id);
            if (student == null || (!student.IsVisible && !User.IsInRole("Admin")))
            {
                return NotFound();
            }

            var donations = await _unitOfWork.Donations.FindAsync(d => d.StudentId == id && d.Status == "Completed");
            var progressReports = await _unitOfWork.ProgressReports.FindAsync(pr => pr.StudentId == id);
            var documents = await _unitOfWork.Documents.FindAsync(d => d.StudentId == id);

            ViewBag.Donations = donations.OrderByDescending(d => d.CreatedAt).ToList();
            ViewBag.ProgressReports = progressReports.OrderByDescending(pr => pr.ReportDate).ToList();
            ViewBag.Documents = documents.ToList();

            return View(student);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public IActionResult Create()
        {
            return View();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Student student, IFormFile? photo, List<IFormFile>? documents)
        {
            if (ModelState.IsValid)
            {
                // Handle photo upload
                if (photo != null && photo.Length > 0)
                {
                    var photoPath = await SaveFileAsync(photo, "images");
                    student.PhotoUrl = photoPath;
                }

                student.CreatedAt = DateTime.UtcNow;
                student.UpdatedAt = DateTime.UtcNow;

                await _unitOfWork.Students.AddAsync(student);
                await _unitOfWork.SaveChangesAsync();

                // Handle document uploads
                if (documents != null && documents.Any())
                {
                    foreach (var doc in documents)
                    {
                        if (doc.Length > 0)
                        {
                            var docPath = await SaveFileAsync(doc, "documents");
                            var document = new Document
                            {
                                StudentId = student.Id,
                                FileName = doc.FileName,
                                FilePath = docPath,
                                FileType = Path.GetExtension(doc.FileName),
                                FileSize = doc.Length,
                                UploadedAt = DateTime.UtcNow
                            };
                            await _unitOfWork.Documents.AddAsync(document);
                        }
                    }
                    await _unitOfWork.SaveChangesAsync();
                }

                TempData["SuccessMessage"] = "Student created successfully.";
                return RedirectToAction("Index");
            }

            return View(student);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> Edit(int id)
        {
            var student = await _unitOfWork.Students.GetByIdAsync(id);
            if (student == null)
            {
                return NotFound();
            }

            return View(student);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Student student, IFormFile? photo)
        {
            if (id != student.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                var existingStudent = await _unitOfWork.Students.GetByIdAsync(id);
                if (existingStudent == null)
                {
                    return NotFound();
                }

                // Handle photo upload
                if (photo != null && photo.Length > 0)
                {
                    var photoPath = await SaveFileAsync(photo, "images");
                    existingStudent.PhotoUrl = photoPath;
                }

                existingStudent.FullName = student.FullName;
                existingStudent.Age = student.Age;
                existingStudent.Location = student.Location;
                existingStudent.Story = student.Story;
                existingStudent.AcademicBackground = student.AcademicBackground;
                existingStudent.DreamCareer = student.DreamCareer;
                existingStudent.FundingGoal = student.FundingGoal;
                existingStudent.IsVisible = student.IsVisible;
                existingStudent.UpdatedAt = DateTime.UtcNow;

                _unitOfWork.Students.Update(existingStudent);
                await _unitOfWork.SaveChangesAsync();

                TempData["SuccessMessage"] = "Student updated successfully.";
                return RedirectToAction("Index");
            }

            return View(student);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id)
        {
            var student = await _unitOfWork.Students.GetByIdAsync(id);
            if (student == null)
            {
                return NotFound();
            }

            _unitOfWork.Students.Remove(student);
            await _unitOfWork.SaveChangesAsync();

            TempData["SuccessMessage"] = "Student deleted successfully.";
            return RedirectToAction("Index");
        }

        [Authorize(Roles = "Student")]
        [HttpGet]
        public async Task<IActionResult> MyProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return RedirectToAction("Login", "Account");

            var student = await _unitOfWork.Students.FirstOrDefaultAsync(s => s.ApplicationUserId == userId);
            if (student == null)
            {
                return NotFound();
            }

            var donations = await _unitOfWork.Donations.FindAsync(d => d.StudentId == student.Id && d.Status == "Completed");
            var followers = await _unitOfWork.Follows.FindAsync(f => f.StudentId == student.Id);

            ViewBag.Donations = donations.ToList();
            ViewBag.Followers = followers.ToList();
            ViewBag.TotalRaised = donations.Sum(d => d.Amount);

            return View(student);
        }

        [Authorize(Roles = "Student")]
        [HttpGet]
        public async Task<IActionResult> MyDonors()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return RedirectToAction("Login", "Account");

            var student = await _unitOfWork.Students.FirstOrDefaultAsync(s => s.ApplicationUserId == userId);
            if (student == null)
            {
                return NotFound();
            }

            var donations = await _unitOfWork.Donations.FindAsync(d => d.StudentId == student.Id && d.Status == "Completed");
            var donorIds = donations.Select(d => d.DonorId).Distinct().ToList();
            var donors = new List<ApplicationUser>();

            foreach (var donorId in donorIds)
            {
                var donor = await _userManager.FindByIdAsync(donorId);
                if (donor != null)
                {
                    donors.Add(donor);
                }
            }

            return View(donors);
        }

        private async Task<string> SaveFileAsync(IFormFile file, string folder)
        {
            var uploadsFolder = Path.Combine(_environment.WebRootPath, folder);
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


