using StudentCharityHub.Models;

namespace StudentCharityHub.Services
{
    public interface IReportService
    {
        Task<byte[]> GenerateCSVReportAsync();
        Task<byte[]> GeneratePDFReportAsync(int studentId);
        Task<byte[]> GenerateStudentProgressPDFAsync(int studentId);
    }
}



