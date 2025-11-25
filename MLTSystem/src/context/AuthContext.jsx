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
    }),
    new User(2, 'li.ming@example.com', 'password123', 'tutor', {
      firstName: 'Li',
      lastName: 'Ming',
      bio: 'Experienced Mandarin tutor',
      verificationDocuments: []
    }),
    new User(3, 'admin@mltsystem.com', 'admin123', 'admin', {
      firstName: 'Admin',
      lastName: 'User',
      bio: 'System administrator'
    })
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
      const session = getSession();
      if (session && session.user) {
        try {
          const user = User.fromData(session.user);
          setCurrentUser(user);
        } catch (error) {
          console.error('Error initializing session:', error);
          clearSession();
        }
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
        setCurrentUser(null);
        clearSession();
      } else if (shouldRefreshSession()) {
        // Refresh session if needed
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
    // Mock authentication - in a real app, this would be an API call
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      // Check if tutor is approved
      if (user.role === 'tutor' && !user.isApproved) {
        return { 
          success: false, 
          error: 'Your account is pending admin approval. Please wait for approval before logging in.' 
        };
      }
      
      // Create session with token
      const session = createSession(user);
      setCurrentUser(user);
      
      return { 
        success: true,
        session: {
          expiresAt: new Date(session.expiryTime),
          timeRemaining: getSessionTimeRemaining()
        }
      };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = async (userData) => {
    // Mock registration - in a real app, this would be an API call
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, error: 'Email already exists' };
    }

    // Parse fullName into firstName and lastName
    const nameParts = (userData.fullName || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newUser = new User(
      users.length + 1,
      userData.email,
      userData.password,
      userData.role,
      {
        firstName: firstName,
        lastName: lastName,
        bio: userData.bio || '',
        verificationDocuments: userData.verificationDocuments || []
      }
    );

    // Set verification documents if provided
    if (userData.verificationDocuments && userData.verificationDocuments.length > 0) {
      newUser.verificationDocuments = userData.verificationDocuments;
    }

    setUsers(prev => [...prev, newUser]);
    
    // Only set current user if not a tutor (tutors need approval)
    if (userData.role !== 'tutor') {
      // Create session for non-tutor users
      const session = createSession(newUser);
      setCurrentUser(newUser);
      
      return { 
        success: true,
        session: {
          expiresAt: new Date(session.expiryTime),
          timeRemaining: getSessionTimeRemaining()
        }
      };
    }
    
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    clearSession();
  };

  const updateProfile = async (profileData) => {
    if (!currentUser) return { success: false, error: 'No user logged in' };

    console.log('updateProfile called with:', profileData);
    console.log('Current user before update:', currentUser);

    // Separate profile fields from user-level fields
    const { email, password, ...profileFields } = profileData;

    console.log('Profile fields:', profileFields);
    console.log('Password provided:', !!password);

    // Create a new User instance to maintain prototype methods
    const updatedUser = new User(
      currentUser.id,
      currentUser.email,
      currentUser.password,
      currentUser.role,
      currentUser.profile
    );

    console.log('User instance created:', updatedUser);

    // Update profile using the method
    updatedUser.updateProfile(profileFields);

    console.log('After updateProfile call:', updatedUser);

    // If password is provided, update it
    if (password) {
      updatedUser.password = password;
    }

    // Update in users array
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    
    // Refresh session with updated user data
    refreshSession(updatedUser);

    console.log('Final updated user:', updatedUser);

    return { success: true };
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
