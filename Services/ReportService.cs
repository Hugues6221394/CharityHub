using CsvHelper;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using StudentCharityHub.Models;
using StudentCharityHub.Repositories;
using System.Globalization;
using System.Text;
using PdfDocument = QuestPDF.Fluent.Document;


namespace StudentCharityHub.Services
{
    public class ReportService : IReportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<ReportService> _logger;

        public ReportService(IUnitOfWork unitOfWork, ILogger<ReportService> logger)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<byte[]> GenerateCSVReportAsync()
        {
            try
            {
                var students = await _unitOfWork.Students.GetAllAsync();
                var donations = await _unitOfWork.Donations.GetAllAsync();

                using var memoryStream = new MemoryStream();
                using var writer = new StreamWriter(memoryStream, Encoding.UTF8);
                using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

                csv.WriteField("Student ID");
                csv.WriteField("Full Name");
                csv.WriteField("Age");
                csv.WriteField("Location");
                csv.WriteField("Funding Goal");
                csv.WriteField("Amount Raised");
                csv.WriteField("Funding Status");
                csv.WriteField("Donor Count");
                csv.WriteField("Total Donations");
                csv.NextRecord();

                foreach (var student in students)
                {
                    var studentDonations = donations.Where(d => d.StudentId == student.Id && d.Status == "Completed").ToList();
                    var donorCount = studentDonations.Select(d => d.DonorId).Distinct().Count();
                    var totalDonations = studentDonations.Sum(d => d.Amount);
                    var fundingStatus = student.AmountRaised >= student.FundingGoal ? "Fully Funded" : "Partially Funded";

                    csv.WriteField(student.Id);
                    csv.WriteField(student.FullName);
                    csv.WriteField(student.Age);
                    csv.WriteField(student.Location);
                    csv.WriteField(student.FundingGoal);
                    csv.WriteField(student.AmountRaised);
                    csv.WriteField(fundingStatus);
                    csv.WriteField(donorCount);
                    csv.WriteField(totalDonations);
                    csv.NextRecord();
                }

                writer.Flush();
                return memoryStream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating CSV report");
                throw;
            }
        }

        public async Task<byte[]> GeneratePDFReportAsync(int studentId)
        {
            try
            {
                var student = await _unitOfWork.Students.GetByIdAsync(studentId);
                if (student == null)
                    throw new ArgumentException("Student not found");

                var donations = await _unitOfWork.Donations.FindAsync(d => d.StudentId == studentId);
                var progressReports = await _unitOfWork.ProgressReports.FindAsync(pr => pr.StudentId == studentId);

                QuestPDF.Settings.License = LicenseType.Community;

                var document = PdfDocument.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);
                        page.PageColor(Colors.White);
                        page.DefaultTextStyle(x => x.FontSize(12));

                        page.Header()
                            .Text("Student Progress Report")
                            .SemiBold().FontSize(24).FontColor(Colors.Blue.Medium);

                        page.Content()
                            .PaddingVertical(1, Unit.Centimetre)
                            .Column(column =>
                            {
                                column.Spacing(20);

                                column.Item().Text($"Student: {student.FullName}").SemiBold();
                                column.Item().Text($"Age: {student.Age}");
                                column.Item().Text($"Location: {student.Location}");
                                column.Item().Text($"Funding Goal: ${student.FundingGoal:F2}");
                                column.Item().Text($"Amount Raised: ${student.AmountRaised:F2}");
                                column.Item().Text($"Progress: {(student.AmountRaised / student.FundingGoal * 100):F1}%");

                                column.Item().Padding(10).Text("Story:").SemiBold();
                                column.Item().Text(student.Story);

                                column.Item().Padding(10).Text("Progress Reports:").SemiBold();
                                foreach (var report in progressReports.OrderByDescending(r => r.ReportDate))
                                {
                                    column.Item().Text($"{report.Title} - {report.ReportDate:yyyy-MM-dd}");
                                    column.Item().Text(report.Description);
                                }

                                column.Item().Padding(10).Text("Donations:").SemiBold();
                                foreach (var donation in donations.Where(d => d.Status == "Completed"))
                                {
                                    column.Item().Text($"${donation.Amount:F2} - {donation.CreatedAt:yyyy-MM-dd}");
                                }
                            });

                        page.Footer()
                            .AlignCenter()
                            .Text(x =>
                            {
                                x.Span("Page ");
                                x.CurrentPageNumber();
                                x.Span(" of ");
                                x.TotalPages();
                            });
                    });
                });

                return document.GeneratePdf();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating PDF report");
                throw;
            }
        }

        public async Task<byte[]> GenerateStudentProgressPDFAsync(int studentId)
        {
            return await GeneratePDFReportAsync(studentId);
        }
    }
}



