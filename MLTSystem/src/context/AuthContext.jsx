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
    try {
<<<<<<< Updated upstream
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
=======
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
>>>>>>> Stashed changes
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
<<<<<<< Updated upstream
        return { success: false, error: result.error || 'Login failed' };
      }

      // Construct a User instance from backend user data
      const apiUser = result.user;
      const user = new User(
=======
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
>>>>>>> Stashed changes
        apiUser.id,
        apiUser.email,
        '', // Password not stored in frontend
        apiUser.role,
        {
<<<<<<< Updated upstream
          firstName: apiUser.name?.split(' ')[0] || '',
          lastName: apiUser.name?.split(' ').slice(1).join(' ') || '',
=======
          firstName: firstName,
          lastName: lastName,
>>>>>>> Stashed changes
          bio: apiUser.bio || '',
          verificationDocuments: apiUser.verificationDocuments || []
        }
      );

<<<<<<< Updated upstream
      // Store session token and info in sessionStorage
=======
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

      // Store session token
>>>>>>> Stashed changes
      if (result.session && result.session.token) {
        sessionStorage.setItem('mlt_session_token', result.session.token);
        sessionStorage.setItem('mlt_session_expiry', new Date(result.session.expiresAt).getTime().toString());
        sessionStorage.setItem('mlt_session_user', JSON.stringify(apiUser));
<<<<<<< Updated upstream
      }

      setCurrentUser(user);
      setIsLoading(false);

      return {
        success: true,
        session: {
          token: result.session.token,
=======
        
        // Create session
        const session = createSession(newUser);
        setCurrentUser(newUser);
      }

      return { 
        success: true,
        session: result.session ? {
>>>>>>> Stashed changes
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
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
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
          availability: userData.availability
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
<<<<<<< Updated upstream
          firstName: apiUser.name?.split(' ')[0] || '',
          lastName: apiUser.name?.split(' ').slice(1).join(' ') || '',
=======
          firstName: firstName,
          lastName: lastName,
>>>>>>> Stashed changes
          bio: apiUser.bio || '',
          verificationDocuments: apiUser.verificationDocuments || []
        }
      );

      // Set approval status from API
      if (apiUser.status) {
        newUser.isApproved = apiUser.status === 'active';
        newUser.approvalStatus = apiUser.status === 'active' ? 'approved' : apiUser.status;
      }

      // Update users list (for admin dashboard)
      setUsers(prev => [...prev, newUser]);

      // Only set current user if session is provided (not pending tutors)
      if (result.session && result.session.token) {
        // Store session token
        sessionStorage.setItem('mlt_session_token', result.session.token);
        sessionStorage.setItem('mlt_session_expiry', new Date(result.session.expiresAt).getTime().toString());
        sessionStorage.setItem('mlt_session_user', JSON.stringify(apiUser));
        
        // Create session
        const session = createSession(newUser);
        setCurrentUser(newUser);
        setIsLoading(false);
        
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
  const getPendingTutors = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/pending-tutors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const result = await response.json();
      if (result.success) {
        return result.tutors || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching pending tutors:', error);
      return [];
    }
  };

  // Approve tutor
  const approveTutor = async (tutorId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/approve-tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tutorId })
      });
      const result = await response.json();
      if (result.success) {
        console.log('Tutor approved successfully');
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Error approving tutor:', error);
      return { success: false, error: error.message };
    }
  };

  // Reject tutor
  const rejectTutor = async (tutorId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/reject-tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tutorId })
      });
      const result = await response.json();
      if (result.success) {
        console.log('Tutor rejected successfully');
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('Error rejecting tutor:', error);
      return { success: false, error: error.message };
    }
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
