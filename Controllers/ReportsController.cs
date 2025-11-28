using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentCharityHub.Services;

namespace StudentCharityHub.Controllers
{
    [Authorize(Roles = "Admin")]
    public class ReportsController : Controller
    {
        private readonly IReportService _reportService;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
        {
            _reportService = reportService;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> DownloadCSV()
        {
            try
            {
                var csvData = await _reportService.GenerateCSVReportAsync();
                return File(csvData, "text/csv", $"students-report-{DateTime.UtcNow:yyyyMMdd}.csv");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating CSV report");
                TempData["ErrorMessage"] = "Error generating CSV report.";
                return RedirectToAction("Index");
            }
        }

        [HttpGet]
        public async Task<IActionResult> DownloadPDF(int studentId)
        {
            try
            {
                var pdfData = await _reportService.GeneratePDFReportAsync(studentId);
                return File(pdfData, "application/pdf", $"student-{studentId}-report-{DateTime.UtcNow:yyyyMMdd}.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF report");
                TempData["ErrorMessage"] = "Error generating PDF report.";
                return RedirectToAction("Index", "Student");
            }
        }

        [HttpGet]
        public async Task<IActionResult> DownloadProgressPDF(int studentId)
        {
            try
            {
                var pdfData = await _reportService.GenerateStudentProgressPDFAsync(studentId);
                return File(pdfData, "application/pdf", $"student-{studentId}-progress-{DateTime.UtcNow:yyyyMMdd}.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating progress PDF report");
                TempData["ErrorMessage"] = "Error generating progress PDF report.";
                return RedirectToAction("Details", "Student", new { id = studentId });
            }
        }
    }
}


