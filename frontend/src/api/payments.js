const API_BASE = (() => {
  const env = process.env.REACT_APP_API_URL;
  if (env) return env.replace(/\/$/, "");
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') return ""; // CRA proxy
  if (typeof window !== 'undefined') return window.location.origin;
  return "";
})();

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("authToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchPayments() {
  const res = await fetch(`${API_BASE}/api/payments`, { headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error(`Failed to fetch payments (${res.status})`);
  return await res.json();
}

export async function fetchPaymentsByStudent(studentId) {
  const res = await fetch(`${API_BASE}/api/payments/student/${encodeURIComponent(studentId)}`, { headers: { ...getAuthHeaders() } });
  if (!res.ok) throw new Error(`Failed to fetch payments (${res.status})`);
  return await res.json();
}

export async function createPayment(data) {
  const res = await fetch(`${API_BASE}/api/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Failed to create payment (${res.status})`);
  }
  return await res.json();
}

export async function updatePayment(id, data) {
  const res = await fetch(`${API_BASE}/api/payments/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Failed to update payment (${res.status})`);
  }
  return await res.json();
}

export async function deletePayment(id) {
  const res = await fetch(`${API_BASE}/api/payments/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete payment (${res.status}) ${text}`);
  }
  return true;
}
