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

export async function fetchAssignments({ studentId } = {}) {
  const qs = studentId ? `?studentId=${encodeURIComponent(studentId)}` : "";
  const res = await fetch(`${API_BASE}/api/assignments${qs}`, { headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error(`Failed to fetch assignments (${res.status})`);
  return await res.json();
}

export async function createAssignment(data) {
  const res = await fetch(`${API_BASE}/api/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Failed to create assignment (${res.status})`);
  }
  return await res.json();
}

export async function updateAssignment(id, data) {
  const res = await fetch(`${API_BASE}/api/assignments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Failed to update assignment (${res.status})`);
  }
  return await res.json();
}

export async function deleteAssignment(id) {
  const res = await fetch(`${API_BASE}/api/assignments/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Failed to delete assignment (${res.status})`);
  }
  return true;
}

const API_BASE = (() => {
  const env = process.env.REACT_APP_API_URL;
  if (env) return env.replace(/\/$/, "");
  if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
    return "";
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "";
})();

const FALLBACK_API_BASE = "http://localhost:5000";

function getAuthHeaders() {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchWithFallback(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    });
    return res;
  } catch (_err) {
    const res = await fetch(`${FALLBACK_API_BASE}${url}`, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
    });
    return res;
  }
}

export async function fetchAssignments() {
  const res = await fetchWithFallback("/api/assignments");
  if (!res.ok) throw new Error(`Failed to fetch assignments (${res.status})`);
  return res.json();
}

export async function createAssignment(payload) {
  const res = await fetchWithFallback("/api/assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Failed to create assignment (${res.status})`);
  }
  return res.json();
}

export async function updateAssignment(id, payload) {
  const res = await fetchWithFallback(`/api/assignments/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Failed to update assignment (${res.status})`);
  }
  return res.json();
}

export async function deleteAssignment(id) {
  const res = await fetchWithFallback(`/api/assignments/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Failed to delete assignment (${res.status})`);
  }
  return true;
}
