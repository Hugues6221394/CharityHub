using Microsoft.Extensions.Configuration;
using StudentCharityHub.Models;
using StudentCharityHub.Repositories;

namespace StudentCharityHub.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IConfiguration _configuration;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(
            IConfiguration configuration,
            IUnitOfWork unitOfWork,
            ILogger<PaymentService> logger)
        {
            _configuration = configuration;
            _unitOfWork = unitOfWork;
            _logger = logger;
        }

        public async Task<PaymentResult> ProcessPayPalPaymentAsync(Donation donation, string returnUrl, string cancelUrl)
        {
            try
            {
                // PayPal integration stub
                // In production, use PayPal SDK
                var clientId = _configuration["PayPal:ClientId"];
                var clientSecret = _configuration["PayPal:ClientSecret"];
                var mode = _configuration["PayPal:Mode"] ?? "sandbox";

                // Generate transaction ID
                var transactionId = $"PP-{Guid.NewGuid()}";

                // Create payment log
                var paymentLog = new PaymentLog
                {
                    DonationId = donation.Id,
                    TransactionId = transactionId,
                    PaymentMethod = "PayPal",
                    Status = "Pending",
                    Amount = donation.Amount,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.PaymentLogs.AddAsync(paymentLog);
                await _unitOfWork.SaveChangesAsync();

                // In production, create PayPal order and return approval URL
                var paymentUrl = $"https://www.sandbox.paypal.com/checkoutnow?token={transactionId}";

                return new PaymentResult
                {
                    Success = true,
                    TransactionId = transactionId,
                    PaymentUrl = paymentUrl,
                    Metadata = new Dictionary<string, string>
                    {
                        { "PaymentMethod", "PayPal" },
                        { "Mode", mode }
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing PayPal payment");
                return new PaymentResult
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<PaymentResult> ProcessMTNMobileMoneyPaymentAsync(Donation donation, string phoneNumber)
        {
            try
            {
                // MTN Mobile Money integration stub
                var apiKey = _configuration["MTNMobileMoney:ApiKey"];
                var apiSecret = _configuration["MTNMobileMoney:ApiSecret"];
                var environment = _configuration["MTNMobileMoney:Environment"] ?? "sandbox";

                // Generate transaction ID
                var transactionId = $"MTN-{Guid.NewGuid()}";

                // Create payment log
                var paymentLog = new PaymentLog
                {
                    DonationId = donation.Id,
                    TransactionId = transactionId,
                    PaymentMethod = "MTNMobileMoney",
                    Status = "Pending",
                    Amount = donation.Amount,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.PaymentLogs.AddAsync(paymentLog);
                await _unitOfWork.SaveChangesAsync();

                // In production, call MTN Mobile Money API
                // This is a stub implementation

                return new PaymentResult
                {
                    Success = true,
                    TransactionId = transactionId,
                    Metadata = new Dictionary<string, string>
                    {
                        { "PaymentMethod", "MTNMobileMoney" },
                        { "PhoneNumber", phoneNumber },
                        { "Environment", environment }
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing MTN Mobile Money payment");
                return new PaymentResult
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<PaymentResult> VerifyPaymentAsync(string transactionId, string paymentMethod)
        {
            try
            {
                var paymentLog = await _unitOfWork.PaymentLogs.FirstOrDefaultAsync(
                    pl => pl.TransactionId == transactionId && pl.PaymentMethod == paymentMethod);

                if (paymentLog == null)
                {
                    return new PaymentResult
                    {
                        Success = false,
                        ErrorMessage = "Payment not found"
                    };
                }

                // In production, verify with payment provider
                // For now, simulate verification
                paymentLog.Status = "Completed";
                paymentLog.CompletedAt = DateTime.UtcNow;
                _unitOfWork.PaymentLogs.Update(paymentLog);

                var donation = await _unitOfWork.Donations.GetByIdAsync(paymentLog.DonationId);
                if (donation != null)
                {
                    donation.Status = "Completed";
                    donation.CompletedAt = DateTime.UtcNow;
                    donation.TransactionId = transactionId;
                    _unitOfWork.Donations.Update(donation);
                }

                await _unitOfWork.SaveChangesAsync();

                return new PaymentResult
                {
                    Success = true,
                    TransactionId = transactionId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying payment");
                return new PaymentResult
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<string> GenerateReceiptAsync(Donation donation)
        {
            // Generate receipt URL or path
            var receiptId = $"RCP-{donation.Id}-{Guid.NewGuid()}";
            var receiptUrl = $"/receipts/{receiptId}.pdf";

            donation.ReceiptUrl = receiptUrl;
            _unitOfWork.Donations.Update(donation);
            await _unitOfWork.SaveChangesAsync();

            return receiptUrl;
        }
    }
}


