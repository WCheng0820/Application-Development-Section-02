// src/utils/sessionManager.js
// Session management utilities for authentication

const SESSION_TOKEN_KEY = 'mlt_session_token';
const SESSION_EXPIRY_KEY = 'mlt_session_expiry';
const SESSION_USER_KEY = 'mlt_session_user';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Generate a simple session token (in production, use JWT or similar)
 * @param {Object} userData - User data to encode in token
 * @returns {string} Session token
 */
export const generateSessionToken = (userData) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const userHash = btoa(JSON.stringify({
    id: userData.id,
    email: userData.email,
    role: userData.role,
    timestamp
  })).replace(/[^a-zA-Z0-9]/g, '');
  
  return `${userHash}.${random}.${timestamp}`;
};

/**
 * Validate and decode session token
 * @param {string} token - Session token to validate
 * @returns {Object|null} Decoded user data or null if invalid
 */
export const validateSessionToken = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    // If token is from backend (hex format, ~64 chars), it's already validated by backend
    // Just return a placeholder indicating it's valid
    if (token.length > 32 && !token.includes('.')) {
      // Backend token format - trust it's valid since it came from our backend
      return { validated: true };
    }

    // For local tokens, validate the format
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const decoded = JSON.parse(atob(parts[0]));
    return decoded;
  } catch (error) {
    console.error('Error validating session token:', error);
    return null;
  }
};

/**
 * Check if session is expired
 * @param {number} expiryTime - Expiry timestamp
 * @returns {boolean} True if expired
 */
export const isSessionExpired = (expiryTime) => {
  if (!expiryTime) {
    return true;
  }
  return Date.now() > expiryTime;
};

/**
 * Create a new session
 * @param {Object} user - User object
 * @returns {Object} Session data
 */
export const createSession = (user) => {
  const token = generateSessionToken(user);
  const expiryTime = Date.now() + SESSION_DURATION;
  
  // Store in sessionStorage (more secure than localStorage for sessions)
  sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  sessionStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
  sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    profile: user.profile,
    isApproved: user.isApproved,
    approvalStatus: user.approvalStatus
  }));

  return {
    token,
    expiryTime,
    user
  };
};

/**
 * Get current session from storage
 * @returns {Object|null} Session data or null if no valid session
 */
export const getSession = () => {
  const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
  const expiryTime = sessionStorage.getItem(SESSION_EXPIRY_KEY);
  const userData = sessionStorage.getItem(SESSION_USER_KEY);

  if (!token || !expiryTime || !userData) {
    console.debug('🔍 Session check: No token/expiry/userData found', { hasToken: !!token, hasExpiry: !!expiryTime, hasUserData: !!userData });
    return null;
  }

  // Check if session is expired
  if (isSessionExpired(parseInt(expiryTime, 10))) {
    console.debug('🔍 Session check: Token expired', { expiryTime: new Date(parseInt(expiryTime, 10)) });
    clearSession();
    return null;
  }

  // Validate token
  const decoded = validateSessionToken(token);
  if (!decoded) {
    console.debug('🔍 Session check: Token validation failed');
    clearSession();
    return null;
  }

  try {
    const user = JSON.parse(userData);
    console.debug('✅ Session check: Valid session found for', { userId: user.id, email: user.email });
    return {
      token,
      expiryTime: parseInt(expiryTime, 10),
      user
    };
  } catch (error) {
    console.error('Error parsing session user data:', error);
    clearSession();
    return null;
  }
};

/**
 * Clear session from storage
 */
export const clearSession = () => {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
  sessionStorage.removeItem(SESSION_EXPIRY_KEY);
  sessionStorage.removeItem(SESSION_USER_KEY);
};

/**
 * Refresh session (extend expiry time)
 * @param {Object} user - User object
 * @returns {Object} Updated session data
 */
export const refreshSession = (user) => {
  const existingToken = sessionStorage.getItem(SESSION_TOKEN_KEY);
  if (!existingToken) {
    return createSession(user);
  }

  const expiryTime = Date.now() + SESSION_DURATION;
  sessionStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
  
  // Update user data in case it changed
  sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
    profile: user.profile,
    isApproved: user.isApproved,
    approvalStatus: user.approvalStatus
  }));

  return {
    token: existingToken,
    expiryTime,
    user
  };
};

/**
 * Get time remaining until session expires (in milliseconds)
 * @returns {number} Time remaining or 0 if expired
 */
export const getSessionTimeRemaining = () => {
  const expiryTime = sessionStorage.getItem(SESSION_EXPIRY_KEY);
  if (!expiryTime) {
    return 0;
  }

  const remaining = parseInt(expiryTime, 10) - Date.now();
  return remaining > 0 ? remaining : 0;
};

/**
 * Check if session needs refresh (within last 10% of duration)
 * @returns {boolean} True if session should be refreshed
 */
export const shouldRefreshSession = () => {
  const timeRemaining = getSessionTimeRemaining();
  const refreshThreshold = SESSION_DURATION * 0.1; // 10% of session duration
  return timeRemaining > 0 && timeRemaining < refreshThreshold;
};

