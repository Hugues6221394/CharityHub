import api from './api';

export const paymentService = {
    // PayPal payments
    async createPayPalOrder(studentId, amount) {
        const response = await api.post('/payments/paypal/create-order', {
            studentId,
            amount,
        });
        return response.data;
    },

    async capturePayPalOrder(orderId, studentId) {
        const response = await api.post('/payments/paypal/capture-order', {
            orderId,
            studentId,
        });
        return response.data;
    },

    // MTN Mobile Money payments
    async initiateMTNPayment(studentId, amount, phoneNumber) {
        const response = await api.post('/payments/mtn/initiate', {
            studentId,
            amount,
            phoneNumber,
        });
        return response.data;
    },

    async getMTNPaymentStatus(transactionId) {
        const response = await api.get(`/payments/mtn/status/${transactionId}`);
        return response.data;
    },

    // Donation history
    async getMyDonations() {
        const response = await api.get('/payments/my-donations');
        return response.data;
    },
};
