import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./pages/Home";
import SignupForm from "./pages/SignupForm";
import Dashboard from "./Dashboard/Dashboard";
import Login from './pages/Login';
import FindTutors from './pages/FindTutors';
import ForBusiness from './pages/ForBusiness';
import BecomeTutor from './pages/BecomeTutor';

function App() {
  const [users, setUsers] = useState([]);

  // Example: Fetch users from backend at http://localhost:5000/users
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    fetch("http://localhost:5000/api/tutors", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Error fetching users:", err));
}, []);


  const RequireAuth = ({ children, role }) => {
    const token = localStorage.getItem("accessToken");
    const savedRole = localStorage.getItem("role");
    if (!token) return <Navigate to="/login" replace />;
    if (role && savedRole !== role) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Allow Home to render when app is served under /my-react-app */}
        <Route path="/my-react-app" element={<Home />} />
        <Route path="/login" element={<Login />} />
        {/* Support login when app is served under /my-react-app */}
        <Route path="/my-react-app/login" element={<Login />} />
        <Route path="/signupform" element={<SignupForm />} />
        {/* Support signup when app is served under /my-react-app */}
        <Route path="/my-react-app/signup" element={<SignupForm />} />
        <Route path="/find-tutors" element={<FindTutors />} />
        <Route path="/for-business" element={<ForBusiness />} />
        <Route path="/become-tutor" element={<BecomeTutor />} />
        {/* Student dashboard (read-only for tutors list) */}
        <Route
          path="/student"
          element={
            <RequireAuth role="student">
              <Dashboard users={users} isAdmin={false} />
            </RequireAuth>
          }
        />
        {/* Admin dashboard (can add/remove teachers) */}
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <Dashboard users={users} isAdmin={true} />
            </RequireAuth>
          }
        />
        {/* Tutor dashboard */}
        <Route
          path="/tutor"
          element={
            <RequireAuth role="tutor">
              <Dashboard users={users} isAdmin={false} />
            </RequireAuth>
          }
        />
        {/* Backward compatibility: redirect /dashboard to role-specific page if possible */}
        <Route
          path="/dashboard"
          element={
            localStorage.getItem("role") === "admin"
              ? <Navigate to="/admin" replace />
              : localStorage.getItem("role") === "tutor"
              ? <Navigate to="/tutor" replace />
              : localStorage.getItem("role") === "student"
              ? <Navigate to="/student" replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="/signup" element={<SignupForm />} />
      </Routes>
    </Router>
  );
}

export default App;
