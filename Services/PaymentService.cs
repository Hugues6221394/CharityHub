using Microsoft.Extensions.Configuration;
using StudentCharityHub.Models;
using StudentCharityHub.Repositories;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace StudentCharityHub.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IConfiguration _configuration;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<PaymentService> _logger;
        private readonly IHttpClientFactory _httpClientFactory;

        public PaymentService(
            IConfiguration configuration,
            IUnitOfWork unitOfWork,
            ILogger<PaymentService> logger,
            IHttpClientFactory httpClientFactory)
        {
            _configuration = configuration;
            _unitOfWork = unitOfWork;
            _logger = logger;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<PaymentResult> ProcessPayPalPaymentAsync(Donation donation, string returnUrl, string cancelUrl)
        {
            try
            {
                var order = await CreatePayPalOrderAsync(donation, returnUrl, cancelUrl);
                if (order == null)
                {
                    return new PaymentResult
                    {
                        Success = false,
                        ErrorMessage = "Unable to create PayPal order."
                    };
                }

                var approvalUrl = order.Links.FirstOrDefault(l => l.Rel.Equals("approve", StringComparison.OrdinalIgnoreCase))?.Href;
                if (string.IsNullOrEmpty(approvalUrl))
                {
                    return new PaymentResult
                    {
                        Success = false,
                        ErrorMessage = "Unable to retrieve PayPal approval URL."
                    };
                }

                var paymentLog = new PaymentLog
                {
                    DonationId = donation.Id,
                    StudentId = donation.StudentId,
                    TransactionId = order.Id,
                    PaymentMethod = "PayPal",
                    Status = "Pending",
                    Amount = donation.Amount,
                    CreatedAt = DateTime.UtcNow,
                    ResponseData = "Order created"
                };

                await _unitOfWork.PaymentLogs.AddAsync(paymentLog);
                await _unitOfWork.SaveChangesAsync();

                return new PaymentResult
                {
                    Success = true,
                    TransactionId = order.Id,
                    PaymentUrl = approvalUrl,
                    Metadata = new Dictionary<string, string>
                    {
                        { "PaymentMethod", "PayPal" },
                        { "Mode", _configuration["PayPal:Mode"] ?? "sandbox" }
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
                // MTN Mobile Money TEST/STUB implementation
                // No real API call is made – this is for local testing only.
                var transactionId = $"MTN-TEST-{Guid.NewGuid():N}".Substring(0, 20);

                var paymentLog = new PaymentLog
                {
                    DonationId = donation.Id,
                    StudentId = donation.StudentId,
                    TransactionId = transactionId,
                    PaymentMethod = "MTNMobileMoney",
                    Status = "Completed",
                    Amount = donation.Amount,
                    CreatedAt = DateTime.UtcNow,
                    CompletedAt = DateTime.UtcNow,
                    ResponseData = $"TEST MTN payment for {phoneNumber}"
                };

                await _unitOfWork.PaymentLogs.AddAsync(paymentLog);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Simulated MTN Mobile Money payment completed for Donation {DonationId}, Phone {Phone}.", donation.Id, phoneNumber);

                return new PaymentResult
                {
                    Success = true,
                    TransactionId = transactionId,
                    Metadata = new Dictionary<string, string>
                    {
                        { "PaymentMethod", "MTNMobileMoney" },
                        { "PhoneNumber", phoneNumber },
                        { "Mode", "TestStub" }
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

                var captureResult = await CapturePayPalOrderAsync(transactionId);
                if (!captureResult)
                {
                    return new PaymentResult
                    {
                        Success = false,
                        ErrorMessage = "Unable to capture PayPal order."
                    };
                }

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

        private async Task<string> GetPayPalAccessTokenAsync()
        {
            var clientId = _configuration["PayPal:ClientId"];
            var clientSecret = _configuration["PayPal:ClientSecret"];
            if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(clientSecret))
            {
                throw new InvalidOperationException("PayPal credentials are not configured.");
            }

            var baseUrl = GetPayPalApiBase();
            var httpClient = _httpClientFactory.CreateClient();

            var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/v1/oauth2/token");
            var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{clientSecret}"));
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", credentials);
            request.Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "grant_type", "client_credentials" }
            });

            var response = await httpClient.SendAsync(request);
            response.EnsureSuccessStatusCode();

            var token = await response.Content.ReadFromJsonAsync<PayPalTokenResponse>();
            if (token == null || string.IsNullOrEmpty(token.AccessToken))
            {
                throw new InvalidOperationException("Unable to retrieve PayPal access token.");
            }

            return token.AccessToken;
        }

        private async Task<PayPalOrderResponse?> CreatePayPalOrderAsync(Donation donation, string returnUrl, string cancelUrl)
        {
            var accessToken = await GetPayPalAccessTokenAsync();
            var baseUrl = GetPayPalApiBase();
            var httpClient = _httpClientFactory.CreateClient();

            var orderRequest = new
            {
                intent = "CAPTURE",
                purchase_units = new[]
                {
                    new
                    {
                        amount = new
                        {
                            currency_code = "USD",
                            value = donation.Amount.ToString("F2")
                        },
                        description = $"Donation for student {donation.StudentId}"
                    }
                },
                application_context = new
                {
                    return_url = returnUrl,
                    cancel_url = cancelUrl
                }
            };

            var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/v2/checkout/orders");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Content = new StringContent(JsonSerializer.Serialize(orderRequest), Encoding.UTF8, "application/json");

            var response = await httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to create PayPal order. Status: {StatusCode}, Body: {Body}", response.StatusCode, body);
                return null;
            }

            var order = await response.Content.ReadFromJsonAsync<PayPalOrderResponse>();
            return order;
        }

        private async Task<bool> CapturePayPalOrderAsync(string orderId)
        {
            var accessToken = await GetPayPalAccessTokenAsync();
            var baseUrl = GetPayPalApiBase();
            var httpClient = _httpClientFactory.CreateClient();

            var request = new HttpRequestMessage(HttpMethod.Post, $"{baseUrl}/v2/checkout/orders/{orderId}/capture");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Content = new StringContent("{}", Encoding.UTF8, "application/json");

            var response = await httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed to capture PayPal order {OrderId}. Status: {StatusCode}, Body: {Body}", orderId, response.StatusCode, body);
                return false;
            }

            var order = await response.Content.ReadFromJsonAsync<PayPalOrderResponse>();
            return order != null && order.Status.Equals("COMPLETED", StringComparison.OrdinalIgnoreCase);
        }

        private string GetPayPalApiBase()
        {
            var mode = (_configuration["PayPal:Mode"] ?? "sandbox").ToLowerInvariant();
            return mode == "live"
                ? "https://api-m.paypal.com"
                : "https://api-m.sandbox.paypal.com";
        }

        private sealed class PayPalTokenResponse
        {
            [JsonPropertyName("access_token")]
            public string AccessToken { get; set; } = string.Empty;
        }

        private sealed class PayPalOrderResponse
        {
            [JsonPropertyName("id")]
            public string Id { get; set; } = string.Empty;

            [JsonPropertyName("status")]
            public string Status { get; set; } = string.Empty;

            [JsonPropertyName("links")]
            public List<PayPalLink> Links { get; set; } = new();
        }

        private sealed class PayPalLink
        {
            [JsonPropertyName("href")]
            public string Href { get; set; } = string.Empty;

            [JsonPropertyName("rel")]
            public string Rel { get; set; } = string.Empty;
        }
    }
}



