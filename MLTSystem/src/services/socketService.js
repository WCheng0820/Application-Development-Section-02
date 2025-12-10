import io from 'socket.io-client';

let socket = null;

/**
 * Initialize socket connection
 * @param {string} userId - Current user's ID (studentId or tutorId)
 * @returns {Object} Socket instance
 */
export function initSocket(userId) {
  if (socket && socket.connected) {
    console.log('Socket already connected');
    return socket;
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  socket = io(API_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling']
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Connected to WebSocket server:', socket.id);
    
    // Notify server that user is online
    socket.emit('user:online', userId);
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from WebSocket server');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Get socket instance
 */
export function getSocket() {
  return socket;
}

/**
 * Join conversation room
 * @param {number|null} bookingId - Booking ID or null for non-booked chats
 * @param {string} senderId - Current user ID
 * @param {string} recipientId - Other participant ID
 */
export function joinConversation(bookingId, senderId, recipientId) {
  if (!socket) return;
  
  const conversationId = bookingId || `${[senderId, recipientId].sort().join('-')}`;
  socket.emit('conversation:join', { conversationId });
  console.log(`📍 Joined conversation: ${conversationId}`);
}

/**
 * Leave conversation room
 * @param {number|null} bookingId - Booking ID or null for non-booked chats
 * @param {string} senderId - Current user ID
 * @param {string} recipientId - Other participant ID
 */
export function leaveConversation(bookingId, senderId, recipientId) {
  if (!socket) return;
  
  const conversationId = bookingId || `${[senderId, recipientId].sort().join('-')}`;
  socket.emit('conversation:leave', { conversationId });
  console.log(`📍 Left conversation: ${conversationId}`);
}

/**
 * Send message through socket
 * @param {Object} data - Message data {bookingId, senderId, recipientId, content, attachment}
 */
export function sendMessage(data) {
  if (!socket || !socket.connected) {
    console.warn('Socket not connected, falling back to HTTP');
    return false;
  }
  
  socket.emit('message:send', data);
  return true;
}

/**
 * Listen for incoming messages
 * @param {Function} callback - Callback when message is received
 */
export function onMessageReceived(callback) {
  if (!socket) return;
  socket.on('message:received', callback);
}

/**
 * Remove message received listener
 */
export function offMessageReceived() {
  if (!socket) return;
  socket.off('message:received');
}

/**
 * Send typing indicator
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID
 * @param {string} userName - User's display name
 * @param {boolean} isTyping - Is user typing
 */
export function setTypingStatus(conversationId, userId, userName, isTyping) {
  if (!socket || !socket.connected) return;
  
  if (isTyping) {
    socket.emit('typing:start', { conversationId, userId, userName });
  } else {
    socket.emit('typing:stop', { conversationId, userId, userName });
  }
}

/**
 * Listen for typing indicators
 * @param {Function} callback - Callback with { userId, isTyping }
 */
export function onTypingStatus(callback) {
  if (!socket) return;
  socket.on('typing:active', callback);
}

/**
 * Remove typing status listener
 */
export function offTypingStatus() {
  if (!socket) return;
  socket.off('typing:active');
}

/**
 * Emit message read receipt
 * @param {string} conversationId - Conversation ID
 * @param {number} messageId - Message ID
 * @param {string} userId - User ID
 */
export function sendReadReceipt(conversationId, messageId, userId) {
  if (!socket || !socket.connected) return;
  
  socket.emit('message:read', { conversationId, messageId, userId });
}

/**
 * Listen for read receipts
 * @param {Function} callback - Callback with { messageId, userId, readAt }
 */
export function onReadReceipt(callback) {
  if (!socket) return;
  socket.on('message:read', callback);
}

/**
 * Remove read receipt listener
 */
export function offReadReceipt() {
  if (!socket) return;
  socket.off('message:read');
}

/**
 * Listen for user online/offline status
 * @param {Function} callback - Callback with { userId, status, onlineUsers }
 */
export function onUserStatus(callback) {
  if (!socket) return;
  socket.on('user:status', callback);
}

/**
 * Remove user status listener
 */
export function offUserStatus() {
  if (!socket) return;
  socket.off('user:status');
}

/**
 * Listen for new notifications
 * @param {Function} callback - Callback with notification data
 */
export function onNotification(callback) {
  if (!socket) return;
  socket.on('notification:new', callback);
}

/**
 * Remove notification listener
 */
export function offNotification() {
  if (!socket) return;
  socket.off('notification:new');
}
