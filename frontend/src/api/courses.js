const API_BASE = (() => {
  const env = process.env.REACT_APP_API_URL;
  if (env) return env.replace(/\/$/, "");
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') return ""; // use CRA proxy
  if (typeof window !== 'undefined') return window.location.origin;
  return "";
})();

// Fallback backend URL for when proxy doesn't work
const FALLBACK_API_BASE = "http://localhost:5000";

function getAuthHeaders() {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper function to fetch with fallback
async function fetchWithFallback(url, options = {}) {
  try {
    const proxyUrl = `${API_BASE}${url}`;
    const res = await fetch(proxyUrl, {
      ...options,
      headers: { ...getAuthHeaders(), ...options.headers },
      mode: 'cors',
      credentials: 'omit'
    });
    return res;
  } catch (err) {
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

// Get all courses
export async function fetchCourses() {
  const res = await fetchWithFallback('/api/courses');
  if (!res.ok) throw new Error(`Failed to fetch courses (${res.status})`);
  return await res.json();
}

// Get single course
export async function getCourse(courseId) {
  const res = await fetchWithFallback(`/api/courses/${courseId}`);
  if (!res.ok) throw new Error(`Failed to fetch course (${res.status})`);
  return await res.json();
}

// Get tutors for a specific course
export async function getCourseTutors(courseId) {
  const res = await fetchWithFallback(`/api/courses/${courseId}/tutors`);
  if (!res.ok) throw new Error(`Failed to fetch tutors for course (${res.status})`);
  return await res.json();
}

// Create course
export async function createCourse(courseData) {
  try {
    const res = await fetchWithFallback('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    });
    
    if (!res.ok) {
      let errorData = {};
      try {
        errorData = await res.json();
      } catch (e) {
        const text = await res.text();
        throw new Error(`Server error (${res.status}): ${text || 'Unknown error'}`);
      }
      
      // Provide more specific error messages
      if (res.status === 404) {
        throw new Error('Courses API endpoint not found. Please make sure the backend server is running and has been restarted after adding the courses route.');
      }
      if (res.status === 500) {
        const dbError = errorData.message || errorData.details || 'Unknown database error';
        if (dbError.includes('Table') && dbError.includes("doesn't exist")) {
          throw new Error('Courses table does not exist. Please run the SQL commands in MySQL local.session.sql to create the courses table.');
        }
        throw new Error(`Database error: ${dbError}`);
      }
      
      throw new Error(errorData.message || errorData.error || `Failed to create course (${res.status})`);
    }
    
    return await res.json();
  } catch (err) {
    // Handle network errors
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error('Cannot connect to server. Please make sure the backend server is running on port 5000.');
    }
    throw err;
  }
}

// Update course
export async function updateCourse(courseId, courseData) {
  const res = await fetchWithFallback(`/api/courses/${courseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(courseData)
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to update course (${res.status})`);
  }
  
  return await res.json();
}

// Delete course
export async function deleteCourse(courseId) {
  const res = await fetchWithFallback(`/api/courses/${courseId}`, {
    method: 'DELETE'
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to delete course (${res.status})`);
  }
  
  return await res.json();
}

// Get courses for a tutor
export async function getTutorCourses(tutorId) {
  const res = await fetchWithFallback(`/api/courses/tutor/${tutorId}`);
  if (!res.ok) throw new Error(`Failed to fetch tutor courses (${res.status})`);
  return await res.json();
}

// Assign course to tutor
export async function assignCourseToTutor(tutorId, courseId) {
  const res = await fetchWithFallback(`/api/courses/tutor/${tutorId}/course/${courseId}`, {
    method: 'POST'
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to assign course (${res.status})`);
  }
  
  return await res.json();
}

// Remove course from tutor
export async function removeCourseFromTutor(tutorId, courseId) {
  const res = await fetchWithFallback(`/api/courses/tutor/${tutorId}/course/${courseId}`, {
    method: 'DELETE'
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to remove course (${res.status})`);
  }
  
  return await res.json();
}

