import api from './api';

export const donationService = {
    async createDonation(data) {
        const response = await api.post('/donations', data);
        return response.data;
    },

    async getDonation(id) {
        const response = await api.get(`/donations/${id}`);
        return response.data;
    },

    async getMyDonations() {
        const response = await api.get('/donations/my-donations');
        return response.data;
    },

    async processPayment(id, paymentDetails) {
        const response = await api.post(`/donations/${id}/process-payment`, paymentDetails);
        return response.data;
    },

    async getStatistics() {
        const response = await api.get('/donations/statistics');
        return response.data;
    },
};
