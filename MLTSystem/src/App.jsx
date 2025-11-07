import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import FindTutors from "./pages/FindTutors";
import Bookings from "./pages/Bookings";
import Materials from "./pages/Materials";
import Messages from "./pages/Messages";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/find-tutors" element={<FindTutors />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </Router>
  );
}
