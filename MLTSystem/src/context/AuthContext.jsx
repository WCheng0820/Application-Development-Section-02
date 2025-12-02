// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User } from '../models/User';
import {
  createSession,
  getSession,
  clearSession,
  refreshSession,
  shouldRefreshSession,
  getSessionTimeRemaining
} from '../utils/sessionManager';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionCheckInterval = useRef(null);

  // Mock user database - in a real app, this would be an API call
  const [users, setUsers] = useState([
    new User(1, 'alice@example.com', 'password123', 'student', {
      firstName: 'Alice',
      lastName: 'Wang',
      bio: 'Mandarin learner'
    }, 'alice'),
    new User(2, 'li.ming@example.com', 'password123', 'tutor', {
      firstName: 'Li',
      lastName: 'Ming',
      bio: 'Experienced Mandarin tutor',
      verificationDocuments: []
    }, 'li.ming'),
    new User(3, 'admin@mltsystem.com', 'admin123', 'admin', {
      firstName: 'Admin',
      lastName: 'User',
      bio: 'System administrator'
    }, 'admin')
  ]);

  // Initialize: Approve existing tutor for demo purposes
  useEffect(() => {
    const existingTutor = users.find(u => u.id === 2 && u.role === 'tutor');
    if (existingTutor && !existingTutor.isApproved) {
      existingTutor.approve();
      setUsers(prev => prev.map(u => u.id === 2 ? existingTutor : u));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize session on app load
  useEffect(() => {
    const initializeSession = () => {
      console.log('🔄 Initializing session on app load...');
      const session = getSession();
      if (session && session.user) {
        try {
          console.log('✅ Session found, restoring user:', { id: session.user.id, email: session.user.email });
          const user = User.fromData(session.user);
          setCurrentUser(user);
        } catch (error) {
          console.error('Error initializing session:', error);
          clearSession();
        }
      } else {
        console.log('ℹ️  No active session found on app load');
      }
      setIsLoading(false);
    };

    initializeSession();
  }, []);

  // Set up session validation interval (check every 5 minutes)
  useEffect(() => {
    if (!currentUser) {
      // Clear interval if no user
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = null;
      }
      return;
    }

    // Set up session validation interval
    sessionCheckInterval.current = setInterval(() => {
      const session = getSession();
      if (!session) {
        // Session expired or invalid
        console.warn('⚠️  Session validation failed - logging out user');
        setCurrentUser(null);
        clearSession();
      } else if (shouldRefreshSession()) {
        // Refresh session if needed
        console.log('🔄 Refreshing session...');
        const user = User.fromData(session.user);
        refreshSession(user);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Cleanup interval on unmount or when user changes
    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
        sessionCheckInterval.current = null;
      }
    };
  }, [currentUser]);

  const login = async (email, password) => {
    try {
      // Call backend API for login
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { 
          success: false, 
          error: result.error || 'Login failed' 
        };
      }

      // Convert API response to User object
      const apiUser = result.user;

      // Parse name into first and last name safely
      const nameParts = apiUser.name ? apiUser.name.split(' ') : [];
      const firstName = apiUser.profile?.firstName || nameParts[0] || '';
      const lastName = apiUser.profile?.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');

      const newUser = new User(
        apiUser.id,
        apiUser.email,
        '', // Password not stored in frontend
        apiUser.role,
        {
          firstName: firstName,
          lastName: lastName,
          bio: apiUser.bio || '',
          verificationDocuments: apiUser.verificationDocuments || []
        },
        apiUser.username // Include username from API response
      );

      // Set approval status from API
      if (apiUser.isApproved !== undefined) {
        newUser.isApproved = apiUser.isApproved;
      }
      if (apiUser.approvalStatus !== undefined) {
        newUser.approvalStatus = apiUser.approvalStatus;
      }
      if (apiUser.status) {
        newUser.isApproved = apiUser.status === 'active';
        newUser.approvalStatus = apiUser.status === 'active' ? 'approved' : apiUser.status;
      }

      // Store session token from backend
      if (result.session && result.session.token) {
        console.log('💾 Storing backend session token and user data', {
          token: result.session.token.substring(0, 20) + '...',
          expiresAt: new Date(result.session.expiresAt),
          userId: apiUser.id,
          email: apiUser.email
        });
        sessionStorage.setItem('mlt_session_token', result.session.token);
        sessionStorage.setItem('mlt_session_expiry', new Date(result.session.expiresAt).getTime().toString());
        
        // Store the frontend User object structure, not the raw API response
        // This ensures User.fromData() can properly reconstruct it
        const sessionUserData = {
          id: newUser.id,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          username: newUser.username,
          profile: newUser.profile,
          isApproved: newUser.isApproved,
          approvalStatus: newUser.approvalStatus,
          verificationDocuments: newUser.verificationDocuments
        };
        sessionStorage.setItem('mlt_session_user', JSON.stringify(sessionUserData));

        setCurrentUser(newUser);
      }

      return { 
        success: true,
        session: result.session ? {
          expiresAt: new Date(result.session.expiresAt),
          timeRemaining: getSessionTimeRemaining()
        } : undefined
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during login' 
      };
    }
  };

  const register = async (userData) => {
    try {
      // Call backend API for registration
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          nophone: userData.nophone || null,
          fullName: userData.fullName,
          verificationDocuments: userData.verificationDocuments || [],
          // Student fields
          yearOfStudy: userData.yearOfStudy,
          programme: userData.programme,
          faculty: userData.faculty,
          // Tutor fields
          yearsOfExperience: userData.yearsOfExperience,
          availability: userData.availability,
          bio: userData.bio,
          specialization: userData.specialization
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { 
          success: false, 
          error: result.error || 'Registration failed' 
        };
      }

      // Convert API response to User object
      const apiUser = result.user;
      const newUser = new User(
        apiUser.id,
        apiUser.email,
        '', // Password not stored in frontend
        apiUser.role,
        {
          firstName: apiUser.profile?.firstName || apiUser.name?.split(' ')[0] || '',
          lastName: apiUser.profile?.lastName || apiUser.name?.split(' ').slice(1).join(' ') || '',
          bio: apiUser.bio || '',
          verificationDocuments: apiUser.verificationDocuments || []
        },
        apiUser.username // Include username from API response
      );

      // Set approval status from API
      if (apiUser.isApproved !== undefined) {
        newUser.isApproved = apiUser.isApproved;
      }
      if (apiUser.approvalStatus !== undefined) {
        newUser.approvalStatus = apiUser.approvalStatus;
      }
      if (apiUser.status) {
        newUser.isApproved = apiUser.status === 'active';
        newUser.approvalStatus = apiUser.status === 'active' ? 'approved' : apiUser.status;
      }

      // Update users list (for admin dashboard)
      setUsers(prev => [...prev, newUser]);

      // Only set current user if session is provided (not pending tutors)
      if (result.session && result.session.token) {
        // Store session token with consistent User object structure
        sessionStorage.setItem('mlt_session_token', result.session.token);
        sessionStorage.setItem('mlt_session_expiry', new Date(result.session.expiresAt).getTime().toString());
        const sessionUserData = {
          id: newUser.id,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          username: newUser.username,
          profile: newUser.profile,
          isApproved: newUser.isApproved,
          approvalStatus: newUser.approvalStatus,
          verificationDocuments: newUser.verificationDocuments
        };
        sessionStorage.setItem('mlt_session_user', JSON.stringify(sessionUserData));
        
        // Create session
        const session = createSession(newUser);
        setCurrentUser(newUser);
        
        return { 
          success: true,
          session: {
            expiresAt: new Date(result.session.expiresAt),
            timeRemaining: getSessionTimeRemaining()
          }
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during registration' 
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    clearSession();
  };

  const updateProfile = async (profileData) => {
    try {
      // Check if user is logged in
      if (!currentUser) {
        return { success: false, error: 'No user logged in' };
      }

      // Get and validate token
      const token = sessionStorage.getItem('mlt_session_token');
      if (!token) {
        return { success: false, error: 'Session expired. Please log in again.' };
      }

      // Call backend API for profile update
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Prepare payload: trim strings and omit password if blank
      const payload = { ...profileData };
      if (typeof payload.username === 'string') payload.username = payload.username.trim();
      if (typeof payload.email === 'string') payload.email = payload.email.trim();
      if (typeof payload.bio === 'string') payload.bio = payload.bio.trim();
      if (typeof payload.specialization === 'string') payload.specialization = payload.specialization.trim();

      // Remove password field when empty or only whitespace so backend treats it as "not provided"
      if (!payload.password || (typeof payload.password === 'string' && payload.password.trim() === '')) {
        delete payload.password;
      }

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Handle specific error cases
        if (response.status === 401) {
          // Only log out for clear session/token expiry issues
          const errorMessage = result.error || 'Authentication failed';
          if (errorMessage.toLowerCase().includes('invalid or expired token') ||
              errorMessage.toLowerCase().includes('session expired') ||
              errorMessage.toLowerCase().includes('token expired')) {
            setCurrentUser(null);
            clearSession();
            return { success: false, error: 'Session expired. Please log in again.' };
          }
          // For other 401 errors (like validation issues), don't log out
          return { success: false, error: errorMessage };
        }
        return {
          success: false,
          error: result.error || 'Profile update failed'
        };
      }

      // Update current user with new data
      const updatedUser = new User(
        result.user.id,
        result.user.email,
        '', // Password not stored in frontend
        result.user.role,
        {
          firstName: result.user.name?.split(' ')[0] || '',
          lastName: result.user.name?.split(' ').slice(1).join(' ') || '',
          bio: result.user.bio || '',
          verificationDocuments: result.user.verificationDocuments || []
        },
        result.user.username
      );

      // Set approval status from API
      if (result.user.isApproved !== undefined) {
        updatedUser.isApproved = result.user.isApproved;
      }
      if (result.user.approvalStatus !== undefined) {
        updatedUser.approvalStatus = result.user.approvalStatus;
      }
      if (result.user.status) {
        updatedUser.isApproved = result.user.status === 'active';
        updatedUser.approvalStatus = result.user.status === 'active' ? 'approved' : result.user.status;
      }

      // Update users list (for admin dashboard)
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);

      // Refresh session with updated user data - store consistent User object structure
      const storedToken = sessionStorage.getItem('mlt_session_token');
      const storedExpiry = sessionStorage.getItem('mlt_session_expiry');
      if (storedToken && storedExpiry) {
        const sessionUserData = {
          id: updatedUser.id,
          email: updatedUser.email,
          password: updatedUser.password,
          role: updatedUser.role,
          username: updatedUser.username,
          profile: updatedUser.profile,
          isApproved: updatedUser.isApproved,
          approvalStatus: updatedUser.approvalStatus,
          verificationDocuments: updatedUser.verificationDocuments
        };
        sessionStorage.setItem('mlt_session_user', JSON.stringify(sessionUserData));
      }
      refreshSession(updatedUser);

      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred during profile update'
      };
    }
  };

  // Get all users (for admin dashboard)
  const getAllUsers = () => {
    return users;
  };

  // Get pending tutors (for admin approval)
  const getPendingTutors = () => {
    return users.filter(u => u.role === 'tutor' && u.approvalStatus === 'pending');
  };

  // Approve tutor
  const approveTutor = (tutorId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === tutorId && u.role === 'tutor') {
        u.approve();
        return u;
      }
      return u;
    }));
    // Update current user if it's the approved tutor
    if (currentUser && currentUser.id === tutorId) {
      const updatedUser = users.find(u => u.id === tutorId);
      if (updatedUser) {
        updatedUser.approve();
        setCurrentUser(updatedUser);
        refreshSession(updatedUser);
      }
    }
  };

  // Reject tutor
  const rejectTutor = (tutorId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === tutorId && u.role === 'tutor') {
        u.reject();
        return u;
      }
      return u;
    }));
  };

  // Get session info
  const getSessionInfo = () => {
    if (!currentUser) return null;
    const timeRemaining = getSessionTimeRemaining();
    const session = getSession();
    return {
      expiresAt: session ? new Date(session.expiryTime) : null,
      timeRemaining,
      isExpired: timeRemaining === 0
    };
  };

  const value = {
    currentUser,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!currentUser,
    getAllUsers,
    getPendingTutors,
    approveTutor,
    rejectTutor,
    getSessionInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
