import api from './api';

export const managerService = {
    async messageStudentByEmail(studentEmail, message) {
        const response = await api.post('/manager/message-student-by-email', {
            studentEmail,
            message
        });
        return response.data;
    },
};

