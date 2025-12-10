import React from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from '../pages/StudentDashboard';
import TutorDashboard from '../pages/TutorDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import Dashboard from '../pages/Dashboard';

export default function RoleBasedDashboard() {
  const { currentUser } = useAuth();

  if (currentUser?.role === 'student') {
    return <StudentDashboard />;
  } else if (currentUser?.role === 'tutor') {
    return <TutorDashboard />;
  } else if (currentUser?.role === 'admin') {
    return <AdminDashboard />;
  } else {
    return <Dashboard />;
  }
}
