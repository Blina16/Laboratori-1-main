import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FindTutors() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  

  // Load courses (subjects) and initial tutors
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    async function load() {
      try {
        const [coursesRes, tutorsRes] = await Promise.all([
          fetch("http://localhost:5000/api/courses", { headers }),
          fetch("http://localhost:5000/api/tutors", { headers }),
        ]);
        const [coursesData, tutorsData] = await Promise.all([
          coursesRes.json(),
          tutorsRes.json(),
        ]);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setTutors(Array.isArray(tutorsData) ? tutorsData : []);
      } catch (e) {
        console.error("Failed to load filters/tutors", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  

  const categories = useMemo(() => {
    const set = new Set();
    (courses || []).forEach((c) => c.category && set.add(c.category));
    return ["all", ...Array.from(set)];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    if (selectedCategory === "all") return ["all", ...(courses || [])];
    return ["all", ...(courses || []).filter((c) => c.category === selectedCategory)];
  }, [courses, selectedCategory]);

  // When subject changes (course), optionally fetch tutors for that course for precise filtering
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    async function refetchTutorsForCourse() {
      try {
        if (selectedCourse === "all") {
          const res = await fetch("http://localhost:5000/api/tutors", { headers });
          const data = await res.json();
          setTutors(Array.isArray(data) ? data : []);
        } else {
          const res = await fetch(`http://localhost:5000/api/courses/${selectedCourse}/tutors`, { headers });
          const data = await res.json();
          setTutors(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Failed to load tutors list", e);
      }
    }
    refetchTutorsForCourse();
  }, [selectedCourse]);

  

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Find Tutors</h1>
        <button onClick={() => navigate(-1)} style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 6, background: "#fff", cursor: "pointer" }}>Back</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#555", marginBottom: 4 }}>Category</label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd", minWidth: 200 }}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat === "all" ? "All categories" : cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "#555", marginBottom: 4 }}>Subject</label>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} style={{ padding: 8, borderRadius: 6, border: "1px solid #ddd", minWidth: 240 }}>
            {filteredCourses.map((c) => (
              typeof c === "string" ? (
                <option key={c} value={c}>All subjects</option>
              ) : (
                <option key={c.id} value={c.id}>{c.name}</option>
              )
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {tutors.length === 0 && (
            <div style={{ gridColumn: "1 / -1", color: "#777" }}>No tutors found.</div>
          )}
          {tutors.map((tutor) => (
            <div key={tutor.id} style={{ border: "1px solid #eee", borderRadius: 10, padding: 16, background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 999, background: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600 }}>
                  {String(tutor.name || '').slice(0,1)}{String(tutor.surname || '').slice(0,1)}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{tutor.name} {tutor.surname}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>Rate: ${Number(tutor.rate || 0).toFixed(2)}/hr</div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: "#444", minHeight: 40 }}>{tutor.bio || "No bio provided."}</div>

              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
