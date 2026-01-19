import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
    const token = sessionStorage.getItem('mlt_session_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const getDashboardStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/admin/stats?t=${new Date().getTime()}`, {
            headers: getAuthHeader()
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

export const getPendingTutors = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/auth/pending-tutors?t=${new Date().getTime()}`, {
            headers: getAuthHeader()
        });
        return response.data.tutors || [];
    } catch (error) {
        console.error('Error fetching pending tutors:', error);
        throw error;
    }
};

export const approveTutor = async (tutorId) => {
    try {
        const response = await axios.post(`${API_URL}/api/auth/approve-tutor`, 
            { tutorId },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error approving tutor:', error);
        throw error;
    }
};

export const rejectTutor = async (tutorId) => {
    try {
        const response = await axios.post(`${API_URL}/api/admin/reject-user/${tutorId}`, 
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error rejecting tutor:', error);
        throw error;
    }
};

export const getAllSessions = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/admin/sessions?t=${new Date().getTime()}`, {
            headers: getAuthHeader()
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching sessions:', error);
        throw error;
    }
};

export const cancelSession = async (bookingId) => {
    try {
        const response = await axios.post(`${API_URL}/api/admin/cancel-session/${bookingId}`, 
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error cancelling session:', error);
        throw error;
    }
};

export const confirmSession = async (bookingId) => {
    try {
        const response = await axios.post(`${API_URL}/api/admin/confirm-session/${bookingId}`, 
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error confirming session:', error);
        throw error;
    }
};

export const completeSession = async (bookingId) => {
    try {
        const response = await axios.post(`${API_URL}/api/admin/complete-session/${bookingId}`, 
            {},
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error completing session:', error);
        throw error;
    }
};

export const getAllUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/admin/users?t=${new Date().getTime()}`, {
            headers: getAuthHeader()
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const updateUser = async (userId, userData) => {
    try {
        const response = await axios.put(`${API_URL}/api/admin/users/${userId}`, 
            userData,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await axios.delete(`${API_URL}/api/admin/users/${userId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};
