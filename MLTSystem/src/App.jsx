import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import SessionTimeout from "./components/SessionTimeout";
import RoleBasedDashboard from "./components/RoleBasedDashboard";
import FindTutors from "./pages/FindTutors";
import Bookings from "./pages/Bookings";
import Materials from "./pages/Materials";
import Messages from "./pages/Messages";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EditProfile from "./pages/EditProfile";

export default function App() {
  React.useEffect(() => {
    // Global error handler for uncaught errors
    const handleError = (event) => {
      console.error('⚠️ Global error caught:', event.error);
      console.error('Stack:', event.error?.stack);
    };
    
    // Global error handler for unhandled promise rejections
    const handleUnhandledRejection = (event) => {
      console.error('⚠️ Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <SessionTimeout />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <RoleBasedDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/find-tutors"
            element={
              <PrivateRoute>
                <FindTutors />
              </PrivateRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <PrivateRoute>
                <Bookings />
              </PrivateRoute>
            }
          />
          <Route
            path="/materials"
            element={
              <PrivateRoute>
                <Materials />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
