import api from './api';

export const authService = {
    async register(data) {
        const response = await api.post('/auth/register', data);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async login(email, password) {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async verify2FA(userId, code) {
        const response = await api.post('/auth/verify-2fa', {
            UserId: userId,
            Code: code
        });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    getStoredUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    // Profile Management
    async updateProfile(profileData) {
        const response = await api.put('/auth/update-profile', profileData);
        // Update stored user data
        const user = this.getStoredUser();
        if (user) {
            const updatedUser = { ...user, ...profileData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return response.data;
    },

    async changePassword(currentPassword, newPassword) {
        const response = await api.post('/auth/change-password', {
            currentPassword,
            newPassword
        });
        return response.data;
    },

    async uploadProfileImage(formData) {
        const response = await api.post('/auth/upload-profile-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        // Update stored user with new image URL
        const user = this.getStoredUser();
        if (user && response.data.imageUrl) {
            user.profileImageUrl = response.data.imageUrl;
            localStorage.setItem('user', JSON.stringify(user));
        }
        return response.data;
    },

    async updateNotificationPreferences(preferences) {
        const response = await api.put('/auth/notification-preferences', preferences);
        return response.data;
    },

    async deactivateAccount() {
        const response = await api.post('/auth/deactivate-account');
        // Clear local storage after deactivation
        this.logout();
        return response.data;
    },
};
