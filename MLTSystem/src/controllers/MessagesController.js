import * as MessageModel from "../models/MessageModel";
import * as BookingModel from "../models/BookingModel";

// Controller notes:
// - Now integrates with User IDs (userId instead of usernames)
// - Supports bidirectional messaging between student and tutor
// - To integrate MySQL later, replace the internals of these functions with async
//   DB calls. The exported functions are async-ready (return Promises).
// - When switching to DB, you'll need a Users table and will fetch participant info
//   from the Bookings table or a Booking_Participants junction table

// Fetch conversations for a user (both as student and as tutor)
export async function fetchConversations(userId) {
  const bookings = BookingModel.getBookings();
  const convos = bookings.map((b) => {
    const msgs = MessageModel.getMessages(b.id);
    const latest = msgs.length ? msgs[msgs.length - 1] : null;
    
    // Find the other participant (if user is tutor, find student; if student, find tutor)
    let otherParticipantName = b.tutor;
    let otherParticipantId = b.tutorId; // Assume bookings now have tutorId, studentId
    
    // Snippet is the latest message content or attachment name
    const snippet = latest 
      ? latest.content || (latest.attachment && latest.attachment.name) 
      : "No messages yet";
    
    // Check if unread from this user's perspective
    const unread = latest 
      ? !latest.readBy.some((r) => r.userId === userId)
      : false;

    return {
      bookingId: b.id,
      title: `Session with ${otherParticipantName}`,
      otherParticipantId,
      otherParticipantName,
      snippet,
      timestamp: latest ? latest.timestamp : null,
      unread,
    };
  });
  
  // Sort by timestamp desc (bookings with no messages at the end)
  convos.sort((a, z) => (z.timestamp || 0) - (a.timestamp || 0));
  return convos;
}

// Fetch messages for a booking (all participants)
export async function fetchMessages(bookingId) {
  return MessageModel.getMessages(bookingId);
}

// Fetch 1-to-1 thread between two users in a booking
export async function fetchMessageThread(bookingId, userId1, userId2) {
  return MessageModel.getMessagesBetween(bookingId, userId1, userId2);
}

// Send a message from one participant to another (bidirectional support)
export async function sendMessage({ bookingId, senderId, senderName, recipientId, content = "", attachment = null }) {
  // Validate booking exists
  const bookings = BookingModel.getBookings();
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) {
    const e = new Error("booking-not-found");
    e.code = "booking-not-found";
    throw e;
  }

  // Validate using User IDs (tutorId/studentId from AuthContext)
  const tutorId = booking.tutorId;
  const studentId = booking.studentId;
  
  // Validate sender is a participant (by user ID)
  const isParticipant = senderId === tutorId || senderId === studentId;
  if (!isParticipant) {
    const e = new Error(`user-not-participant: userId=${senderId} is not tutor=${tutorId} or student=${studentId}`);
    e.code = "user-not-participant";
    throw e;
  }

  // Determine recipient (if sender is tutor, recipient is student; vice versa)
  const isStudentSending = senderId === studentId;
  const finalRecipientId = isStudentSending ? tutorId : studentId;

  if (!finalRecipientId) {
    const e = new Error("recipient-not-found");
    e.code = "recipient-not-found";
    throw e;
  }

  // Save message with explicit sender/recipient IDs
  const msg = MessageModel.addMessage({
    bookingId,
    senderId,
    senderName: senderName || `User ${senderId}`,
    recipientId: finalRecipientId,
    content,
    attachment,
  });

  // Create notification for the recipient (bidirectional - other participant is notified)
  MessageModel.addNotification({
    recipientId: finalRecipientId,
    senderId,
    bookingId,
    messageId: msg.id,
    text: content || (attachment && attachment.name) || "Attachment",
    type: "message",
  });

  return msg;
}

// Mark message as read
export async function markRead(messageId, userId) {
  return MessageModel.markMessageRead(messageId, userId);
}

// Fetch notifications for a user (by userId)
export async function fetchNotifications(userId) {
  return MessageModel.getNotificationsForUser(userId);
}

// Get unread notification count for a user
export async function getUnreadCount(userId) {
  return MessageModel.getUnreadCount(userId);
}

// Mark notification as read
export async function markNotificationRead(notificationId) {
  return MessageModel.markNotificationRead(notificationId);
}

// Clear all notifications for a user
export async function clearNotificationsForUser(userId) {
  return MessageModel.clearAllForUser(userId);
}
