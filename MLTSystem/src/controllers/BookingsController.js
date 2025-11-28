// Controller layer: orchestrates API calls to backend bookings endpoints
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const BOOKINGS_URL = `${API_BASE}/api/bookings`;

export async function fetchBookings() {
  try {
    const res = await axios.get(BOOKINGS_URL);
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return [];
  }
}

export async function cancelBooking(id) {
  try {
    const res = await axios.delete(`${BOOKINGS_URL}/${id}`);
    return res.data;
  } catch (err) {
    console.error('Error deleting booking:', err);
    throw err;
  }
}

export async function addBooking(booking) {
  try {
    const res = await axios.post(BOOKINGS_URL, booking);
    return res.data;
  } catch (err) {
    console.error('Error adding booking:', err);
    throw err;
  }
}

export async function updateBooking(id, booking) {
  try {
    const res = await axios.put(`${BOOKINGS_URL}/${id}`, booking);
    return res.data;
  } catch (err) {
    console.error('Error updating booking:', err);
    throw err;
  }
}
