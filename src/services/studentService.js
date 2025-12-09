import api from './api';

export const studentService = {
    async getStudents(params = {}) {
        const response = await api.get('/students', { params });
        return response.data;
    },

    async getStudent(id) {
        const response = await api.get(`/students/${id}`);
        return response.data;
    },

    async getStudentDonations(id) {
        const response = await api.get(`/students/${id}/donations`);
        return response.data;
    },

    async getStudentProgressReports(id) {
        const response = await api.get(`/students/${id}/progress-reports`);
        return response.data;
    },

    async getMyProfile() {
        const response = await api.get('/students/my-profile');
        return response.data;
    },

    async updateStudent(id, data) {
        const response = await api.put(`/students/${id}`, data);
        return response.data;
    },

    async deleteStudent(id) {
        const response = await api.delete(`/students/${id}`);
        return response.data;
    },
};
