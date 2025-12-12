using StudentCharityHub.Models;

namespace StudentCharityHub.Services
{
    public interface IPaymentService
    {
        Task<PaymentResult> ProcessPayPalPaymentAsync(Donation donation, string returnUrl, string cancelUrl);
        Task<PaymentResult> ProcessMTNMobileMoneyPaymentAsync(Donation donation, string phoneNumber);
        Task<PaymentResult> VerifyPaymentAsync(string transactionId, string paymentMethod);
        Task<string> GenerateReceiptAsync(Donation donation);
    }

    public class PaymentResult
    {
        public bool Success { get; set; }
        public string? TransactionId { get; set; }
        public string? PaymentUrl { get; set; }
        public string? ErrorMessage { get; set; }
        public Dictionary<string, string>? Metadata { get; set; }
    }
}



