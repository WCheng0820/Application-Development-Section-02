// Controller layer: orchestrates API calls to backend bookings endpoints
import axios from 'axios';
import { formatMalaysiaDate, formatMalaysiaTime } from '../utils/dateUtils';

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

    // Map backend rows to UI-friendly booking objects and format date/time for Malaysia timezone
    return rows.map((r) => {
      const date = r.booking_date ? formatMalaysiaDate(r.booking_date, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : '';
      const time = (r.start_time && r.end_time)
        ? `${formatMalaysiaTime(r.start_time, { dateContext: r.booking_date })} - ${formatMalaysiaTime(r.end_time, { dateContext: r.booking_date })}`
        : '';

      // Build a robust student name from several possible backend fields
      const studentName = r.student_name || r.studentName || r.student_full_name ||
        (r.student_first_name || r.studentFirstName || r.first_name) ?
          `${r.student_first_name || r.studentFirstName || r.first_name} ${r.student_last_name || r.studentLastName || r.last_name || ''}`.trim() :
        r.studentId || r.student || '';

      const tutorName = r.tutor_name || r.tutorName || r.tutor || r.tutorId || '';

      // Build contact objects (email/phone) with fallback field names
      const studentEmail = r.student_email || r.studentEmail || r.student_contact_email || r.email || r.student_contact || null;
      const studentPhone = r.student_phone || r.studentPhone || r.student_contact_phone || r.phone || null;

      const tutorEmail = r.tutor_email || r.tutorEmail || r.tutor_contact_email || r.tutor_contact || null;
      const tutorPhone = r.tutor_phone || r.tutorPhone || r.tutor_contact_phone || null;

      // tutor and student account usernames (if provided by backend)
      const tutorUsername = r.tutor_username || r.tutorUsername || null;
      const studentUsername = r.student_username || r.studentUsername || null;

      return {
        id: r.bookingId,
        tutorId: r.tutorId,
        studentId: r.studentId,
        tutor: tutorName,
        tutorUsername,
        student: studentName,
        studentUsername,
        date,
        time,
        // include per-booking rating so frontend can detect if booking was already rated
        rating: (r.rating !== undefined && r.rating !== null) ? parseInt(r.rating, 10) : null,
        feedback: r.feedback_rating ? {
            rating: r.feedback_rating,
            comment: r.feedback_comment,
            isAnonymous: r.feedback_anonymous
        } : null,
        subject: r.subject,
        status: r.status ? (r.status.charAt(0).toUpperCase() + r.status.slice(1)) : 'Pending',
        studentContact: { email: studentEmail, phone: studentPhone },
        tutorContact: { email: tutorEmail, phone: tutorPhone },
        raw: r
      };
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return [];
  }
}

export async function cancelBooking(id) {
  try {
    const config = getAxiosConfig();
    // Use PUT to update status to 'cancelled' instead of DELETE, so we keep history
    const res = await axios.put(`${BOOKINGS_URL}/${id}`, { status: 'cancelled' }, config);
    return res.data.success ? res.data : null;
  } catch (err) {
    console.error('Error cancelling booking:', err);
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

export async function deleteBooking(id) {
  try {
    const config = getAxiosConfig();
    const res = await axios.delete(`${BOOKINGS_URL}/${id}`, config);
    return res.data.success;
  } catch (err) {
    console.error('Error deleting booking:', err);
    throw err;
  }
}

export async function submitFeedback(bookingId, rating, comment, isAnonymous) {
  try {
    const config = getAxiosConfig();
    const res = await axios.post(`${BOOKINGS_URL}/${bookingId}/feedback`, { rating, comment, isAnonymous }, config);
    return res.data;
  } catch (err) {
    console.error('Error submitting feedback:', err);
    throw err;
  }
}

export async function getFeedback(bookingId) {
  try {
    const config = getAxiosConfig();
    const res = await axios.get(`${BOOKINGS_URL}/${bookingId}/feedback`, config);
    return res.data.success ? res.data.data : null;
  } catch (err) {
    console.error('Error fetching feedback:', err);
    return null;
  }
}
