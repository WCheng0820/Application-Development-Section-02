import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MESSAGES_URL = `${API_BASE}/api/messages`;

// Helper to get token from session storage
function getToken() {
  return sessionStorage.getItem('mlt_session_token');
}

// Configure axios instance with auth token
function getAxiosConfig() {
  const token = getToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

// Get all available tutors for student to chat with
export async function fetchAvailableTutors() {
  try {
    const config = getAxiosConfig();
    const res = await axios.get(`${MESSAGES_URL}/tutors`, config);
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Error fetching tutors:', err);
    return [];
  }
}

// Get all available students for tutor to chat with
export async function fetchAvailableStudents() {
  try {
    const config = getAxiosConfig();
    const res = await axios.get(`${MESSAGES_URL}/students`, config);
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Error fetching students:', err);
    return [];
  }
}

// Fetch conversations for a user (includes booked tutors and available tutors)
export async function fetchConversations(userId) {
  try {
    const config = getAxiosConfig();
    const res = await axios.get(`${MESSAGES_URL}/conversations/${userId}`, config);
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Error fetching conversations:', err);
    return [];
  }
}

// Fetch messages for a conversation (booking or direct tutor chat)
export async function fetchMessages(bookingId, senderId = null, recipientId = null) {
  try {
    const config = getAxiosConfig();
    let url = `${MESSAGES_URL}/messages/${bookingId}`;
    
    // Add participant IDs as query params for non-booked chats
    if (!bookingId || bookingId === null || bookingId === 'null') {
      if (senderId && recipientId) {
        url += `?senderId=${senderId}&recipientId=${recipientId}`;
      }
    }
    
    const res = await axios.get(url, config);
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Error fetching messages:', err);
    return [];
  }
}

// Send a message (with or without booking)
export async function sendMessage({ bookingId, senderId, senderName, recipientId, content = "", attachment = null }) {
  try {
    const config = getAxiosConfig();
    const res = await axios.post(
      `${MESSAGES_URL}/messages`,
      { bookingId: bookingId || null, senderId, recipientId, content, attachment },
      config
    );
    return res.data.success ? res.data.data : null;
  } catch (err) {
    console.error('Error sending message:', err);
    throw err;
  }
}

// Mark message as read
export async function markRead(messageId, userId) {
  try {
    const config = getAxiosConfig();
    const res = await axios.post(
      `${MESSAGES_URL}/messages/${messageId}/read`,
      { userId },
      config
    );
    return res.data.success ? res.data : null;
  } catch (err) {
    console.error('Error marking message as read:', err);
    throw err;
  }
}

// Fetch notifications for a user (by userId)
export async function fetchNotifications(userId) {
  try {
    const config = getAxiosConfig();
    const res = await axios.get(`${MESSAGES_URL}/notifications/${userId}`, config);
    return res.data.success ? res.data.data : [];
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return [];
  }
}

// Get unread notification count for a user
export async function getUnreadCount(userId) {
  try {
    const config = getAxiosConfig();
    const res = await axios.get(`${MESSAGES_URL}/unread-count/${userId}`, config);
    return res.data.success ? res.data.data.unreadCount : 0;
  } catch (err) {
    console.error('Error getting unread count:', err);
    return 0;
  }
}

// Get unread messages count for a user
export async function getUnreadMessagesCount(userId) {
  try {
    const config = getAxiosConfig();
    const res = await axios.get(`${MESSAGES_URL}/unread-messages-count/${userId}`, config);
    return res.data.success ? res.data.data.unreadCount : 0;
  } catch (err) {
    console.error('Error getting unread messages count:', err);
    return 0;
  }
}

// Mark notification as read
export async function markNotificationRead(notificationId) {
  try {
    const config = getAxiosConfig();
    const res = await axios.post(
      `${MESSAGES_URL}/notifications/${notificationId}/read`,
      {},
      config
    );
    return res.data.success;
  } catch (err) {
    console.error('Error marking notification as read:', err);
    return false;
  }
}

// Clear all notifications for a user
export async function clearNotificationsForUser(userId) {
  try {
    const notifications = await fetchNotifications(userId);
    for (const n of notifications) {
      if (!n.is_read) {
        await markNotificationRead(n.id);
      }
    }
  } catch (err) {
    console.error('Error clearing notifications:', err);
  }
}
