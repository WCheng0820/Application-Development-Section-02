// In-memory message + notification store with support for bidirectional messaging
// Integrates with User and Role modules for proper user identification
// Structure is MySQL-ready: replace these in-memory arrays with async DB queries

let _nextMessageId = 1;
let _nextNotificationId = 1;

const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024; // 2 MB

let messages = [
  // Enhanced shape for bidirectional messaging:
  // {
  //   id,
  //   bookingId,
  //   senderId,        // User ID of sender (not just name)
  //   senderName,      // Display name (for convenience)
  //   recipientId,     // User ID of recipient (for 1-to-1 or group chats)
  //   content,
  //   attachment: { name, type, size, dataUrl } or null,
  //   timestamp,
  //   readBy: [{ userId, readAt }],  // Track who read and when
  //   status: 'sent' | 'delivered' | 'read'
  // }
];

let notifications = [
  // Enhanced shape for better tracking:
  // {
  //   id,
  //   recipientId,     // User ID (not username)
  //   senderId,        // Who sent the message
  //   bookingId,
  //   messageId,
  //   text,
  //   timestamp,
  //   read,
  //   type: 'message' | 'booking' | 'material'  // notification type
  // }
];

// Retrieve all messages for a booking (bidirectional - all messages in the conversation)
export function getMessages(bookingId) {
  return messages.filter((m) => m.bookingId === bookingId).slice();
}

// Retrieve messages between two specific users in a booking (1-to-1 thread)
export function getMessagesBetween(bookingId, userId1, userId2) {
  return messages.filter((m) => 
    m.bookingId === bookingId &&
    ((m.senderId === userId1 && m.recipientId === userId2) ||
     (m.senderId === userId2 && m.recipientId === userId1))
  ).slice();
}

// Add a message with userId references (bidirectional support)
export function addMessage({ bookingId, senderId, senderName, recipientId, content = "", attachment = null }) {
  if (!senderId || !recipientId) {
    throw new Error("senderId and recipientId are required");
  }

  const id = _nextMessageId++;
  const msg = {
    id,
    bookingId,
    senderId,
    senderName: senderName || `User ${senderId}`,
    recipientId,
    content,
    attachment: attachment ? sanitizeAttachment(attachment) : null,
    timestamp: Date.now(),
    readBy: [{ userId: senderId, readAt: Date.now() }],  // Sender has read their own message
    status: 'sent',
  };
  messages.push(msg);
  return msg;
}

// Mark message as read by a user and update status
export function markMessageRead(messageId, userId) {
  const msg = messages.find((m) => m.id === messageId);
  if (!msg) return null;
  
  const alreadyRead = msg.readBy.find((r) => r.userId === userId);
  if (!alreadyRead) {
    msg.readBy.push({ userId, readAt: Date.now() });
  }
  
  // Update status: if both sender and recipient have read, mark as 'read'
  if (msg.readBy.length >= 2) {
    msg.status = 'read';
  } else if (msg.status === 'sent') {
    msg.status = 'delivered';
  }
  
  return msg;
}

// Get notifications for a specific user (by userId)
export function getNotificationsForUser(userId) {
  return notifications.filter((n) => n.recipientId === userId).slice();
}

// Add notification when a message is sent (bidirectional - notify the other participant)
export function addNotification({ recipientId, senderId, bookingId, messageId, text = "New message", type = "message" }) {
  if (!recipientId || !senderId) {
    throw new Error("recipientId and senderId are required");
  }

  const id = _nextNotificationId++;
  const n = { 
    id, 
    recipientId, 
    senderId, 
    bookingId, 
    messageId, 
    text, 
    type,
    timestamp: Date.now(), 
    read: false 
  };
  notifications.push(n);
  return n;
}

// Mark notification as read
export function markNotificationRead(notificationId) {
  const n = notifications.find((x) => x.id === notificationId);
  if (!n) return null;
  n.read = true;
  return n;
}

// Clear all notifications for a user
export function clearAllForUser(userId) {
  notifications = notifications.filter((n) => n.recipientId !== userId);
}

// Get unread notification count for a user
export function getUnreadCount(userId) {
  return notifications.filter((n) => n.recipientId === userId && !n.read).length;
}

function sanitizeAttachment(att) {
  // att expected: { name, type, size, dataUrl }
  if (!att || typeof att.size !== "number") return null;
  if (att.size > MAX_ATTACHMENT_BYTES) return { error: "too-large" };
  // Only allow images, audio and PDFs (simple check)
  if (!att.type) return null;
  if (!(att.type.startsWith("image/") || att.type.startsWith("audio/") || att.type === "application/pdf")) {
    return { error: "type-not-allowed" };
  }
  return { name: att.name, type: att.type, size: att.size, dataUrl: att.dataUrl };
}
