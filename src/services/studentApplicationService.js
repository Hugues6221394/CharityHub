import api from './api';

export const studentApplicationService = {
    async submitApplication(data) {
        const response = await api.post('/studentapplications', data);
        return response.data;
    },

    async getMyApplication() {
        const response = await api.get('/studentapplications/my-application');
        return response.data;
    },

    async getAllApplications(status = null) {
        const params = status ? { status } : {};
        const response = await api.get('/studentapplications', { params });
        return response.data;
    },

    async getApplication(id) {
        const response = await api.get(`/studentapplications/${id}`);
        return response.data;
    },

    async forwardToAdmin(id) {
        const response = await api.put(`/studentapplications/${id}/forward`);
        return response.data;
    },

    async approveApplication(id) {
        const response = await api.put(`/studentapplications/${id}/approve`);
        return response.data;
    },

    async rejectApplication(id, reason) {
        const response = await api.put(`/studentapplications/${id}/reject`, { reason });
        return response.data;
    },

    async updateApplicationStatus(id, status, reason = '') {
        const response = await api.put(`/studentapplications/${id}/status`, { status, reason });
        return response.data;
    },

    async postAsStudent(id, data = {}) {
        const response = await api.post(`/studentapplications/${id}/post-student`, data);
        return response.data;
    },

    async uploadImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/studentapplications/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    async uploadDocument(file) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/studentapplications/upload-document', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Manager-specific methods
    async getApplicationsForManager() {
        const response = await api.get('/manager/applications');
        return response.data;
    },

    async createApplicationAsManager(applicationData) {
        const response = await api.post('/studentapplications', applicationData);
        return response.data;
    },

    async updateApplication(id, applicationData) {
        const response = await api.put(`/studentapplications/${id}`, applicationData);
        return response.data;
    },

    async deleteApplication(id) {
        const response = await api.delete(`/studentapplications/${id}`);
        return response.data;
    },

    async forwardToAdmin(id) {
        const response = await api.put(`/studentapplications/${id}/forward-to-admin`);
        return response.data;
    },

    async markIncomplete(id, reason) {
        const response = await api.put(`/studentapplications/${id}/mark-incomplete`, { reason });
        return response.data;
    },

    async resubmitApplication(id, data) {
        const response = await api.put(`/studentapplications/${id}/resubmit`, data);
        return response.data;
    },

    async updateApplicationStatus(id, status, reason = null) {
        if (status === 'Approved') {
            return await this.approveApplication(id);
        } else if (status === 'Rejected') {
            return await this.rejectApplication(id, reason);
        }
    },

    // Admin-specific methods
    async getApplicationsForAdmin() {
        const response = await api.get('/studentapplications');
        return response;
    },
};
