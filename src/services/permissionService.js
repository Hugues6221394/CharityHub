import api from './api';

export const permissionService = {
    async getUserPermissions(userId) {
        const response = await api.get(`/admin/permissions/${userId}`);
        return response.data;
    },
    async updateUserPermissions(userId, payload) {
        const response = await api.post(`/admin/permissions/${userId}`, payload);
        return response.data;
    },
    async getAuditLog() {
        const response = await api.get('/admin/permissions/audit');
        return response.data;
    },
};

