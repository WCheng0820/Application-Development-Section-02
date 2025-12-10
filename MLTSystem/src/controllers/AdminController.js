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
        const response = await axios.get(`${API_URL}/api/admin/stats`, {
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
        const response = await axios.get(`${API_URL}/api/auth/pending-tutors`, {
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
    // Assuming there is a reject endpoint, or we use a generic update status
    // For now, let's assume the existing logic in AdminDashboard used a specific endpoint or we need to create one.
    // Checking AdminDashboard.jsx... it calls handleReject but I didn't see the implementation in the snippet.
    // I'll leave this placeholder or implement if I find the endpoint.
    // Based on previous reads, there might not be a specific reject endpoint in auth.js, usually it's just status update.
    // Let's stick to what we know exists or what we added.
    return { success: false, error: 'Not implemented' };
};
