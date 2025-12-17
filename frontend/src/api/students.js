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

export async function fetchStudents() {
  const res = await fetch(`${API_BASE}/api/students`, { headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error(`Failed to fetch students (${res.status})`);
  return await res.json();
}

export async function getStudent(id) {
  const res = await fetch(`${API_BASE}/api/students/${id}`, { headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error(`Failed to fetch student (${res.status})`);
  return await res.json();
}

export async function createStudent(data) {
  const res = await fetch(`${API_BASE}/api/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Failed to create student (${res.status})`);
  }
  return await res.json();
}

export async function updateStudent(id, data) {
  const res = await fetch(`${API_BASE}/api/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Failed to update student (${res.status})`);
  }
  return await res.json();
}

export async function deleteStudent(id) {
  const res = await fetch(`${API_BASE}/api/students/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete student (${res.status}) ${text}`);
  }
  return true;
}
