// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../models/User';

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
      bio: 'Experienced Mandarin tutor'
    }),
    new User(3, 'admin@mltsystem.com', 'admin123', 'admin', {
      firstName: 'Admin',
      lastName: 'User',
      bio: 'System administrator'
    })
  ]);

  useEffect(() => {
    // Check for stored user session on app load
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const user = User.fromData(userData);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock authentication - in a real app, this would be an API call
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  };

  const register = async (userData) => {
    // Mock registration - in a real app, this would be an API call
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, error: 'Email already exists' };
    }

    const newUser = new User(
      users.length + 1,
      userData.email,
      userData.password,
      userData.role,
      {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        bio: userData.bio || ''
      }
    );

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
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
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    console.log('Final updated user:', updatedUser);

    return { success: true };
  };

  const value = {
    currentUser,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
