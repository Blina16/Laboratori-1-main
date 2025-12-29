const API_BASE = (() => {
  const env = process.env.REACT_APP_API_URL;
  if (env) return env.replace(/\/$/, "");
  // In development, try proxy first, but fallback to direct backend URL
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Return empty string to use proxy, but we'll handle fallback in fetch calls
    return "";
  }
  if (typeof window !== 'undefined') return window.location.origin;
  return "";
})();

// Fallback backend URL for when proxy doesn't work
const FALLBACK_API_BASE = "http://localhost:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("authToken") || localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper function to fetch with fallback
async function fetchWithFallback(url, options = {}) {
  try {
    // Try with proxy first (empty API_BASE)
    const proxyUrl = `${API_BASE}${url}`;
    const res = await fetch(proxyUrl, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
      mode: 'cors',
      credentials: 'omit'
    });
    return res;
  } catch (err) {
    // If proxy fails, try direct backend URL
    console.warn('Proxy request failed, trying direct backend URL:', err);
    const directUrl = `${FALLBACK_API_BASE}${url}`;
    return fetch(directUrl, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
      mode: 'cors',
      credentials: 'omit'
    });
  }
}

// Get bookings for a student
export async function getStudentBookings(studentId) {
  const res = await fetchWithFallback(`/api/bookings/student/${studentId}`);
  if (!res.ok) throw new Error(`Failed to fetch bookings (${res.status})`);
  return await res.json();
}

// Get bookings for a tutor
export async function getTutorBookings(tutorId) {
  const res = await fetchWithFallback(`/api/bookings/tutor/${tutorId}`);
  if (!res.ok) throw new Error(`Failed to fetch tutor bookings (${res.status})`);
  return await res.json();
}

// Check availability
export async function checkAvailability(tutorId, date) {
  try {
    // Ensure date is in YYYY-MM-DD format
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    
    if (!tutorId || !dateStr) {
      throw new Error('Tutor ID and date are required');
    }
    
    const url = `/api/bookings/availability/${tutorId}/${dateStr}`;
    console.log('Checking availability:', url); // Debug log
    
    const res = await fetchWithFallback(url);
    
    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `Failed to check availability (${res.status})`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        errorMessage += ` - ${errorText}`;
      }
      throw new Error(errorMessage);
    }
    
    return await res.json();
  } catch (err) {
    console.error('Availability check error:', err);
    // Handle network errors specifically
    if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please make sure the backend server is running on port 5000 and the React dev server is running on port 3000.');
    }
    throw err;
  }
}

// Create a booking
export async function createBooking(bookingData) {
  const res = await fetchWithFallback('/api/bookings', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bookingData)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create booking (${res.status})`);
  }
  return await res.json();
}

// Update booking status
export async function updateBookingStatus(bookingId, status) {
  const res = await fetchWithFallback(`/api/bookings/${bookingId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error(`Failed to update booking (${res.status})`);
  return await res.json();
}

// Delete booking
export async function deleteBooking(bookingId) {
  const res = await fetchWithFallback(`/api/bookings/${bookingId}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error(`Failed to delete booking (${res.status})`);
  return true;
}

// Generate Google Calendar URL
export function generateGoogleCalendarUrl(booking) {
  const startDate = new Date(`${booking.lesson_date}T${booking.lesson_time}`);
  const endDate = new Date(startDate.getTime() + (booking.duration || 60) * 60000);
  
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Lesson with ${booking.tutor_name} ${booking.tutor_surname}`,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: booking.notes || `Lesson booking with ${booking.tutor_name} ${booking.tutor_surname}`,
    location: 'Online'
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

