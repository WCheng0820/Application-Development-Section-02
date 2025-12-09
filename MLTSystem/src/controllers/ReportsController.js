const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeader = () => {
    const token = sessionStorage.getItem('mlt_session_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const createReport = async (reportData) => {
    const response = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(reportData)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to create report');
    return result;
};

export const getReports = async () => {
    const response = await fetch(`${API_URL}/api/reports`, {
        method: 'GET',
        headers: getAuthHeader()
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to fetch reports');
    return result.data;
};

export const updateReport = async (id, status, adminNotes) => {
    const response = await fetch(`${API_URL}/api/reports/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify({ status, adminNotes })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to update report');
    return result;
};
