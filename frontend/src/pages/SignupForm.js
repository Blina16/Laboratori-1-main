import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios"; // <-- import axios

function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("student");
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    alert("Passwords don't match!");
    return;
  }

  try {
      // Determine API base (use REACT_APP_API_URL when set to avoid proxy/path issues)
      const API_BASE = (() => {
        const env = process.env.REACT_APP_API_URL;
        if (env) return env.replace(/\/$/, "");
        return ""; // fall back to relative path + dev server proxy
      })();

      // Send signup data to backend
      const response = await axios.post(`${API_BASE}/auth/signup`, {
        email,
        password,
        name: email.split("@")[0], // or use another field for name
        role: role, // Include role in signup
      });

      const data = response.data;
      alert(data.message || "Signed up!");
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("role", data.user?.role || role);
      localStorage.setItem("email", data.user?.email || email);
      // Navigate based on role
      const userRole = data.user?.role || role;
      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "tutor") {
        navigate("/tutor");
      } else {
        navigate("/student");
      }
    } catch (err) {
      // show error from backend
      alert(err.response?.data?.error || err.response?.data?.message || err.message || "Signup failed!");
    }
  };

  // Styles (updated to match login card design)
  const containerStyle = { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: 24, background: "var(--gradient-soft)", fontFamily: "Inter, sans-serif" };
  const cardStyle = { background: "var(--bg-primary)", padding: 32, borderRadius: 16, boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-light)", width: 420, maxWidth: "95%" };
  const titleStyle = { fontSize: 28, fontWeight: 700, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.02em", textAlign: "center" };
  const subtitleStyle = { color: "var(--text-secondary)", fontSize: 14, marginTop: 8, marginBottom: 16, textAlign: "center" };
  const labelStyle = { fontSize: 12, color: "#566", marginBottom: 6, display: "block" };
  const inputStyle = { width: "100%", padding: 12, borderRadius: 10, border: "1px solid var(--border-light)", outline: "none", fontSize: 15, background: "var(--bg-primary)" };
  const selectStyle = { width: "100%", padding: 12, borderRadius: 10, border: "1px solid var(--border-light)", outline: "none", fontSize: 15, background: "var(--bg-primary)" };
  const buttonStyle = { width: "100%", padding: 14, background: "var(--gradient-primary)", color: "var(--text-white)", border: "none", borderRadius: 12, cursor: "pointer", marginTop: 12, fontSize: 16, fontWeight: 600, boxShadow: "var(--shadow-md)" };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ display: "inline-flex", alignItems: "center", padding: "6px 12px", borderRadius: 999, background: "var(--bg-primary)", border: "1px solid var(--border-light)", color: "var(--text-secondary)", marginBottom: 8 }}>Join our community</div>
          <h2 style={titleStyle}>Create your account</h2>
          <div style={subtitleStyle}>Start learning or teaching with a free account</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input type="password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
          </div>
          <div>
            <label style={labelStyle}>Confirm password</label>
            <input type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={inputStyle} required />
          </div>
          <div>
            <label style={labelStyle}>Sign up as</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} style={selectStyle}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="tutor">Tutor</option>
            </select>
          </div>
          <button type="submit" style={buttonStyle}>Sign Up</button>
        </form>
        <div style={{ marginTop: 12, textAlign: "center", color: "var(--text-secondary)" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Log in</Link>
        </div>
      </div>
    </div>
  );
}

export default SignupForm;
