// Controller layer: orchestrates API calls to backend bookings endpoints
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BOOKINGS_URL = `${API_BASE}/api/bookings`;

// Helper to get token from session storage
function getToken() {
  return sessionStorage.getItem('mlt_session_token');
}

// Configure axios instance with auth token
function getAxiosConfig() {
  const token = getToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

export async function fetchBookings(filters = {}) {
  try {
    const config = getAxiosConfig();
    const res = await axios.get(BOOKINGS_URL, { params: filters, ...config });
    const rows = res.data.success ? res.data.data : [];

    // Map backend rows to UI-friendly booking objects
    return rows.map((r) => ({
      id: r.bookingId,
      tutorId: r.tutorId,
      studentId: r.studentId,
      tutor: r.tutor_name || r.tutorId,
      date: r.booking_date,
      time: r.start_time && r.end_time ? `${r.start_time} - ${r.end_time}` : '',
      subject: r.subject,
      status: r.status ? (r.status.charAt(0).toUpperCase() + r.status.slice(1)) : 'Pending',
      raw: r
    }));
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return [];
  }
}

export async function cancelBooking(id) {
  try {
    const config = getAxiosConfig();
    const res = await axios.delete(`${BOOKINGS_URL}/${id}`, config);
    return res.data.success ? res.data : null;
  } catch (err) {
    console.error('Error deleting booking:', err);
    throw err;
  }
}

export async function addBooking(booking) {
  try {
    const config = getAxiosConfig();
    const res = await axios.post(BOOKINGS_URL, booking, config);
    return res.data;
  } catch (err) {
    console.error('Error adding booking:', err);
    throw err;
  }
}

export async function updateBooking(id, booking) {
  try {
    const config = getAxiosConfig();
    const res = await axios.put(`${BOOKINGS_URL}/${id}`, booking, config);
    return res.data;
  } catch (err) {
    console.error('Error updating booking:', err);
    throw err;
  }
}
