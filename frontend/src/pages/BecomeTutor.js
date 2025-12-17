import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function BecomeTutor() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [bio, setBio] = useState("");
  const [rate, setRate] = useState("");
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load available courses to pick subjects (optional)
    async function loadCourses() {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("http://localhost:5000/api/courses", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        if (Array.isArray(data)) setCourses(data);
      } catch (_) {}
    }
    loadCourses();
  }, []);

  const toggleCourse = (id) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name || !surname) {
      alert("Name and surname are required");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("http://localhost:5000/api/tutors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name, surname, bio, rate: Number(rate) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || data?.error || "Failed to create tutor");

      // Optionally assign selected courses
      if (selectedCourses.length > 0) {
        for (const courseId of selectedCourses) {
          try {
            await fetch(`http://localhost:5000/api/courses/tutor/${data.id}/course/${courseId}`, {
              method: "POST",
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
          } catch (_) {}
        }
      }

      alert("Application submitted! Your tutor profile has been created.");
      localStorage.setItem("role", "tutor");
      navigate("/tutor");
    } catch (err) {
      alert(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Become a Tutor</h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
          Apply to join our tutor community. Provide your details and subject preferences.
        </p>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>First name</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Anna" />
          </div>
          <div>
            <label style={labelStyle}>Last name</label>
            <input style={inputStyle} value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="e.g. Virtanen" />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Short bio</label>
          <textarea rows={4} style={{ ...inputStyle, resize: "vertical" }} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about your experience" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Hourly rate (€)</label>
            <input type="number" step="0.01" min="0" style={inputStyle} value={rate} onChange={(e) => setRate(e.target.value)} placeholder="25" />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Subjects (optional)</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
            {courses.map((c) => (
              <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border-light)", borderRadius: 10, padding: 10 }}>
                <input type="checkbox" checked={selectedCourses.includes(c.id)} onChange={() => toggleCourse(c.id)} />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <button disabled={submitting} type="submit" style={buttonStyle}>
            {submitting ? "Submitting..." : "Submit application"}
          </button>
        </div>
      </form>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: 12, color: "#555", marginBottom: 6 };
const inputStyle = { padding: 12, borderRadius: 10, border: "1px solid var(--border-light)", outline: "none", background: "var(--bg-primary)", width: "100%" };
const buttonStyle = { background: "var(--gradient-primary)", color: "var(--text-white)", padding: "12px 18px", borderRadius: 10, border: "none", fontWeight: 600, cursor: "pointer", boxShadow: "var(--shadow-sm)" };
