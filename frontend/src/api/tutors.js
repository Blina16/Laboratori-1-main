const API_BASE = (() => {
  const env = process.env.REACT_APP_API_URL;
  if (env) return env.replace(/\/$/, "");
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') return ""; // use CRA proxy
  if (typeof window !== 'undefined') return window.location.origin;
  return "";
})();

function getAuthHeaders() {
  // Try common token keys
  const token = localStorage.getItem("accessToken") || localStorage.getItem("authToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchTutors() {
  const res = await fetch(`${API_BASE}/api/tutors`, { headers: { ...getAuthHeaders() } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch tutors (${res.status})${text?.startsWith('<') ? ' - HTML response received' : ''}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Expected JSON but received ${ct || 'unknown'}${text ? `: ${text.slice(0,120)}...` : ''}`);
  }
  return await res.json();
}

export async function createTutor(tutor) {
  const res = await fetch(`${API_BASE}/api/tutors`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(tutor)
  });
  
  if (!res.ok) {
    let errorMessage = `Failed to create tutor (${res.status})`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      const text = await res.text();
      if (text?.startsWith('<')) {
        errorMessage += ' - HTML response received (server may not be running)';
      } else {
        errorMessage += ` - ${text}`;
      }
    }
    throw new Error(errorMessage);
  }
  
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Expected JSON but received ${ct || 'unknown'}${text ? `: ${text.slice(0,120)}...` : ''}`);
  }
  return await res.json();
}

export async function deleteTutor(tutorId) {
  const res = await fetch(`${API_BASE}/api/tutors/${encodeURIComponent(tutorId)}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete tutor (${res.status})${text?.startsWith('<') ? ' - HTML response received' : ''}`);
  }
  return true;
}

export async function updateTutor(tutorId, updates) {
  const res = await fetch(`${API_BASE}/api/tutors/${encodeURIComponent(tutorId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update tutor (${res.status})${text?.startsWith('<') ? ' - HTML response received' : ''}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Expected JSON but received ${ct || 'unknown'}${text ? `: ${text.slice(0,120)}...` : ''}`);
  }
  return await res.json();
}


