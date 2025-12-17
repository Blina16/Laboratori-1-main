const API_BASE = (() => {
  const env = process.env.REACT_APP_API_URL;
  if (env) return env.replace(/\/$/, "");
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') return ""; // CRA proxy
  if (typeof window !== 'undefined') return window.location.origin;
  return "";
})();

function getAuthHeaders() {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchGrades() {
  const res = await fetch(`${API_BASE}/api/grades`, { headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error(`Failed to fetch grades (${res.status})`);
  return await res.json();
}

export async function fetchGradesByStudent(studentId) {
  const res = await fetch(`${API_BASE}/api/grades/student/${studentId}`, { headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error(`Failed to fetch student grades (${res.status})`);
  return await res.json();
}

export async function createGrade(data) {
  const res = await fetch(`${API_BASE}/api/grades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Failed to create grade (${res.status})`);
  }
  return await res.json();
}

export async function updateGrade(id, data) {
  const res = await fetch(`${API_BASE}/api/grades/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Failed to update grade (${res.status})`);
  }
  return await res.json();
}

export async function deleteGrade(id) {
  const res = await fetch(`${API_BASE}/api/grades/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete grade (${res.status}) ${text}`);
  }
  return true;
}
