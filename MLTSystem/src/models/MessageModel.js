// Simple in-memory message + notification store for demo purposes
// This follows the same lightweight pattern as BookingModel used elsewhere in the app.

let _nextMessageId = 1;
let _nextNotificationId = 1;

const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024; // 2 MB

let messages = [
  // sample shape:
  // { id, bookingId, sender, content, attachment:{name,type,size,dataUrl}, timestamp, readBy: [] }
];

let notifications = [
  // { id, recipient, from, bookingId, messageId, text, timestamp, read }
];

export function getMessages(bookingId) {
  return messages.filter((m) => m.bookingId === bookingId).slice();
}

export function addMessage({ bookingId, sender, content = "", attachment = null }) {
  const id = _nextMessageId++;
  const msg = {
    id,
    bookingId,
    sender,
    content,
    attachment: attachment ? sanitizeAttachment(attachment) : null,
    timestamp: Date.now(),
    readBy: [sender],
  };
  messages.push(msg);
  return msg;
}

export function markMessageRead(messageId, username) {
  const msg = messages.find((m) => m.id === messageId);
  if (!msg) return null;
  if (!msg.readBy.includes(username)) msg.readBy.push(username);
  return msg;
}

export function getNotificationsForUser(username) {
  return notifications.filter((n) => n.recipient === username).slice();
}

export function addNotification({ recipient, from, bookingId, messageId, text = "New message" }) {
  const id = _nextNotificationId++;
  const n = { id, recipient, from, bookingId, messageId, text, timestamp: Date.now(), read: false };
  notifications.push(n);
  return n;
}

export function markNotificationRead(notificationId) {
  const n = notifications.find((x) => x.id === notificationId);
  if (!n) return null;
  n.read = true;
  return n;
}

export function clearAllForUser(username) {
  notifications = notifications.filter((n) => n.recipient !== username);
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
