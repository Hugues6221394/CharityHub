using StudentCharityHub.Data;
using StudentCharityHub.Models;

namespace StudentCharityHub.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private IRepository<Student>? _students;
        private IRepository<Donation>? _donations;
        private IRepository<ProgressReport>? _progressReports;
        private IRepository<Message>? _messages;
        private IRepository<Notification>? _notifications;
        private IRepository<Follow>? _follows;
        private IRepository<PaymentLog>? _paymentLogs;
        private IRepository<Document>? _documents;

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
        }

        public IRepository<Student> Students =>
            _students ??= new Repository<Student>(_context);

        public IRepository<Donation> Donations =>
            _donations ??= new Repository<Donation>(_context);

        public IRepository<ProgressReport> ProgressReports =>
            _progressReports ??= new Repository<ProgressReport>(_context);

        public IRepository<Message> Messages =>
            _messages ??= new Repository<Message>(_context);

        public IRepository<Notification> Notifications =>
            _notifications ??= new Repository<Notification>(_context);

        public IRepository<Follow> Follows =>
            _follows ??= new Repository<Follow>(_context);

        public IRepository<PaymentLog> PaymentLogs =>
            _paymentLogs ??= new Repository<PaymentLog>(_context);

        public IRepository<Document> Documents =>
            _documents ??= new Repository<Document>(_context);

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public int SaveChanges()
        {
            return _context.SaveChanges();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}


<<<<<<< HEAD

=======
>>>>>>> origin/GateraMe
