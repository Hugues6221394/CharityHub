using StudentCharityHub.Models;

namespace StudentCharityHub.Repositories
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Student> Students { get; }
        IRepository<Donation> Donations { get; }
        IRepository<ProgressReport> ProgressReports { get; }
        IRepository<Message> Messages { get; }
        IRepository<Notification> Notifications { get; }
        IRepository<Follow> Follows { get; }
        IRepository<PaymentLog> PaymentLogs { get; }
        IRepository<Document> Documents { get; }

        Task<int> SaveChangesAsync();
        int SaveChanges();
    }
}


<<<<<<< HEAD

=======
>>>>>>> origin/GateraMe
