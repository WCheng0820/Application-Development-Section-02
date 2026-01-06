import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import SessionTimeout from "./components/SessionTimeout";
import RoleBasedDashboard from "./components/RoleBasedDashboard";
import FindTutors from "./pages/FindTutors";
import Bookings from "./pages/Bookings";
import Messages from "./pages/Messages";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EditProfile from "./pages/EditProfile";
import ManageSchedule from "./pages/ManageSchedule";
import Payment from "./pages/Payment";
import Reports from "./pages/Reports";
import TutorSetup from "./pages/TutorSetup";
import Upload from "./pages/Upload";
import Materials from "./pages/Materials";
import AdminSessions from "./pages/AdminSessions";
import AdminUsers from "./pages/AdminUsers";
import { useAuth } from "./context/AuthContext";
import AIChatbot from "./components/AIChatbot";

// Role-based materials view
function MaterialsRoute() {
  const { currentUser } = useAuth();
  
  // Students see Upload.jsx (can upload), Tutors/Admins see Materials.jsx (view only)
  if (currentUser?.role === 'student') {
    return <Upload />;
  }
  return <Materials />;
}

// Student restricted components wrapper
function StudentAIWrapper() {
  const { currentUser } = useAuth();
  if (currentUser?.role === 'student') {
    return <AIChatbot />;
  }
  return null;
}

// Page transition wrapper component
function AnimatedRoutes() {
  const location = useLocation();
  // Don't show navbar padding on login/register pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  return (
    <Box sx={{ pt: isAuthPage ? 0 : 8 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Routes location={location}>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/tutor-setup"
            element={
              <PrivateRoute>
                <TutorSetup />
              </PrivateRoute>
            }
          />
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
            path="/payment"
            element={
              <PrivateRoute>
                <Payment />
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Reports />
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
            path="/messages"
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            }
          />
          <Route
            path="/materials"
            element={
              <PrivateRoute>
                {/* Students see Upload.jsx (with upload form), Tutors/Admins see Materials.jsx (view only) */}
                <MaterialsRoute />
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
          <Route
            path="/manage-schedule"
            element={
              <PrivateRoute>
                <ManageSchedule />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/sessions"
            element={
              <PrivateRoute>
                <AdminSessions />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <SessionTimeout />
        <AnimatedRoutes />
        <StudentAIWrapper />
      </Router>
    </AuthProvider>
  );
}