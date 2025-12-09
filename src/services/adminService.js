import api from './api';

export const adminService = {
    // User Management
    async getAllUsers(role = null) {
        const params = role ? { role } : {};
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    async getUser(userId) {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data;
    },

    async createUser(userData) {
        const response = await api.post('/admin/users', userData);
        return response.data;
    },

    async updateUser(userId, userData) {
        const response = await api.put(`/admin/users/${userId}`, userData);
        return response.data;
    },

    async deleteUser(userId) {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    },

    async resetPassword(userId, newPassword) {
        const response = await api.post(`/admin/users/${userId}/reset-password`, { newPassword });
        return response.data;
    },

    async toggleUserActive(userId) {
        const response = await api.post(`/admin/users/${userId}/toggle-active`);
        return response.data;
    },

    // Analytics
    async getAnalytics(period = 'month') {
        const response = await api.get('/admin/analytics/overview', { params: { period } });
        return response.data;
    },

    async getDonationTrends(period = 'month') {
        const response = await api.get('/admin/analytics/donations', { params: { period } });
        return response.data;
    },

    async getUserGrowth(period = 'month') {
        const response = await api.get('/admin/analytics/users', { params: { period } });
        return response.data;
    },

    async getApplicationStats() {
        const response = await api.get('/admin/analytics/applications');
        return response.data;
    },

    // Reports
    async getStudentsReport(startDate = null, endDate = null) {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get('/admin/reports/students', { params });
        return response.data;
    },

    async getDonorsReport(startDate = null, endDate = null) {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get('/admin/reports/donors', { params });
        return response.data;
    },

    async getDonationsReport(startDate = null, endDate = null) {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get('/admin/reports/donations', { params });
        return response.data;
    },

    async getStudentProgressReport(studentId) {
        const response = await api.get(`/admin/reports/student-progress/${studentId}`);
        return response.data;
    },

    async exportStudentsCSV(startDate = null, endDate = null) {
        const params = { type: 'students' };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get('/admin/reports/export-csv', { params, responseType: 'blob' });
        return response.data;
    },

    async exportDonorsCSV(startDate = null, endDate = null) {
        const params = { type: 'donors' };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get('/admin/reports/export-csv', { params, responseType: 'blob' });
        return response.data;
    },

    async exportDonationsCSV(startDate = null, endDate = null) {
        const params = { type: 'donations' };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get('/admin/reports/export-csv', { params, responseType: 'blob' });
        return response.data;
    },
};
