import * as MessageModel from "../models/MessageModel";
import * as BookingModel from "../models/BookingModel";

// Controller notes:
// - Currently this layer delegates to the in-memory MessageModel used for demo.
// - To integrate MySQL later, replace the internals of these functions with async
//   DB calls. The exported functions are async-ready (return Promises) so switching
//   to a DB-backed implementation will be straightforward.

// Return a list of conversations (one per booking) for the current user.
export async function fetchConversations(username) {
  // Build conversation entries from bookings and latest message
  const bookings = BookingModel.getBookings();
  const convos = bookings.map((b) => {
    const msgs = MessageModel.getMessages(b.id);
    const latest = msgs.length ? msgs[msgs.length - 1] : null;
    return {
      bookingId: b.id,
      title: `Session with ${b.tutor}`,
      tutor: b.tutor,
      snippet: latest ? latest.content || (latest.attachment && latest.attachment.name) : "No messages yet",
      timestamp: latest ? latest.timestamp : null,
      unread: latest ? !(latest.readBy || []).includes(username) : false,
    };
  });
  // sort by timestamp desc (put bookings with no messages at the end)
  convos.sort((a, z) => (z.timestamp || 0) - (a.timestamp || 0));
  return convos;
}

export async function fetchMessages(bookingId) {
  return MessageModel.getMessages(bookingId);
}

export async function sendMessage({ bookingId, sender, content = "", attachment = null }) {
  const bookings = BookingModel.getBookings();
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) {
    const e = new Error("booking-not-found");
    e.code = "booking-not-found";
    throw e;
  }

  // Determine if sender is a participant.
  // Assumption: Booking may have `tutor` and optionally `student` fields.
  // If `student` is missing we treat any non-tutor user as the student for demo.
  const tutor = booking.tutor;
  const student = booking.student || "Student";
  const isParticipant = sender === tutor || sender === student;
  if (!isParticipant) {
    const e = new Error("user-not-participant");
    e.code = "user-not-participant";
    throw e;
  }

  // Save message
  const msg = MessageModel.addMessage({ bookingId, sender, content, attachment });

  // Create a notification for the other participant
  const recipient = sender === tutor ? student : tutor;
  MessageModel.addNotification({ recipient, from: sender, bookingId, messageId: msg.id, text: content || "Attachment" });

  return msg;
}

export async function markRead(messageId, username) {
  return MessageModel.markMessageRead(messageId, username);
}

export async function fetchNotifications(username) {
  return MessageModel.getNotificationsForUser(username);
}

export async function markNotificationRead(notificationId) {
  return MessageModel.markNotificationRead(notificationId);
}

export async function clearNotificationsForUser(username) {
  return MessageModel.clearAllForUser(username);
}
