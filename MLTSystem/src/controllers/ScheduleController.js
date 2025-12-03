// ScheduleController.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const SCHEDULE_URL = `${API_BASE}/api/schedule`;

function getToken() {
  return sessionStorage.getItem('mlt_session_token');
}

function getAxiosConfig() {
  const token = getToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

// Reserve a slot (student selects it)
export async function reserveSlot(tutorId, scheduleId, studentId) {
  try {
    const config = getAxiosConfig();
    const res = await axios.post(
      `${SCHEDULE_URL}/${tutorId}/${scheduleId}/reserve`,
      { studentId },
      config
    );
    return res.data.success ? res.data.data : null;
  } catch (err) {
    console.error('Error reserving slot:', err);
    throw err;
  }
}

// Release a reserved slot (student cancels)
export async function releaseSlot(tutorId, scheduleId, studentId) {
  try {
    const config = getAxiosConfig();
    const res = await axios.post(
      `${SCHEDULE_URL}/${tutorId}/${scheduleId}/release`,
      { studentId },
      config
    );
    return res.data.success ? res.data.data : null;
  } catch (err) {
    console.error('Error releasing slot:', err);
    throw err;
  }
}

// Book a slot (after payment confirmed)
export async function bookSlot(tutorId, scheduleId, studentId, subject, paymentMethod) {
  try {
    const config = getAxiosConfig();
    const res = await axios.post(
      `${SCHEDULE_URL}/${tutorId}/${scheduleId}/book`,
      { studentId, subject, paymentMethod },
      config
    );
    return res.data.success ? res.data.data : null;
  } catch (err) {
    console.error('Error booking slot:', err);
    throw err;
  }
}

// Get schedule for a tutor
export async function getTutorSchedule(tutorId) {
  try {
    const config = getAxiosConfig();
    const res = await axios.get(`${SCHEDULE_URL}/${tutorId}`, config);
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Error fetching tutor schedule:', err);
    return [];
  }
}

// Add a schedule slot (tutor only)
export async function addScheduleSlot(tutorId, scheduleData) {
  try {
    const config = getAxiosConfig();
    const res = await axios.post(
      `${SCHEDULE_URL}/${tutorId}`,
      scheduleData,
      config
    );
    return res.data.success ? res.data.data : null;
  } catch (err) {
    console.error('Error adding schedule slot:', err);
    throw err;
  }
}

// Update a schedule slot (tutor only)
export async function updateScheduleSlot(tutorId, scheduleId, scheduleData) {
  try {
    const config = getAxiosConfig();
    const res = await axios.put(
      `${SCHEDULE_URL}/${tutorId}/${scheduleId}`,
      scheduleData,
      config
    );
    return res.data.success ? res.data.data : null;
  } catch (err) {
    console.error('Error updating schedule slot:', err);
    throw err;
  }
}

// Delete a schedule slot (tutor only)
export async function deleteScheduleSlot(tutorId, scheduleId) {
  try {
    const config = getAxiosConfig();
    const res = await axios.delete(
      `${SCHEDULE_URL}/${tutorId}/${scheduleId}`,
      config
    );
    return res.data.success;
  } catch (err) {
    console.error('Error deleting schedule slot:', err);
    throw err;
  }
}
