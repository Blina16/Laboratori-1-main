// ===============================
// API BASE CONFIG
// ===============================

const API_BASE =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "";

// Optional dev debug
if (process.env.NODE_ENV === "development") {
  console.log("[API_BASE]", API_BASE || "(proxy / same-origin)");
}

// ===============================
// CORE REQUEST HELPER
// ===============================

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;

  try {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }

    // Safely parse JSON if present
    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return res.json();
    }

    return null;
  } catch (err) {
    console.error("[NETWORK / API ERROR]", {
      url,
      message: err.message
    });
    throw err;
  }
}

// ===============================
// GENERIC METHODS
// ===============================

const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) =>
    request(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: (path) =>
    request(path, { method: "DELETE" })
};

// ===============================
// TUTORS
// ===============================

export const fetchTutors = () => api.get("/api/tutors");

export const createTutor = (data) =>
  api.post("/api/tutors", data);

export const updateTutor = (id, data) =>
  api.put(`/api/tutors/${id}`, data);

export const deleteTutor = (id) =>
  api.delete(`/api/tutors/${id}`);

// ===============================
// COURSES
// ===============================

export const fetchCourses = () => api.get("/api/courses");

export const createCourse = (data) =>
  api.post("/api/courses", data);

export const updateCourse = (id, data) =>
  api.put(`/api/courses/${id}`, data);

export const deleteCourse = (id) =>
  api.delete(`/api/courses/${id}`);

export const getCourseTutors = (courseId) =>
  api.get(`/api/courses/${courseId}/tutors`);

// ===============================
// STUDENTS
// ===============================

export const fetchStudents = () => api.get("/api/students");

export const createStudent = (data) =>
  api.post("/api/students", data);

export const updateStudent = (id, data) =>
  api.put(`/api/students/${id}`, data);

export const deleteStudent = (id) =>
  api.delete(`/api/students/${id}`);

// ===============================
// GRADES
// ===============================

export const fetchGrades = () => api.get("/api/grades");

export const createGrade = (data) =>
  api.post("/api/grades", data);

export const updateGrade = (id, data) =>
  api.put(`/api/grades/${id}`, data);

export const deleteGrade = (id) =>
  api.delete(`/api/grades/${id}`);



export const getStudentBookings = (studentId) =>
  api.get(`/api/bookings/student/${studentId}`);

// Google Calendar helper (frontend only)
export const generateGoogleCalendarUrl = (booking) => {
  const start = new Date(`${booking.lesson_date}T${booking.lesson_time}`);
  const end = new Date(start.getTime() + booking.duration * 60000);

  const format = (d) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  return (
    "https://www.google.com/calendar/render?action=TEMPLATE" +
    `&text=Lesson with ${booking.tutor_name}` +
    `&dates=${format(start)}/${format(end)}`
  );
};

// ===============================
// ASSIGNMENTS
// ===============================

export const fetchAssignments = (studentId) => {
  if (studentId == null || studentId === "") return api.get("/api/assignments");
  return api.get(`/api/assignments?studentId=${encodeURIComponent(studentId)}`);
};

export const createAssignment = (data) =>
  api.post("/api/assignments", data);

export const updateAssignment = (id, data) =>
  api.put(`/api/assignments/${id}`, data);

export const submitAssignment = (id, files) => {
  if (files && files.length > 0) {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    // When sending FormData, let the browser set Content-Type (it adds boundary)
    return fetch(`${API_BASE}/api/assignments/${id}/submit`, {
      method: "PUT",
      body: formData
    }).then(res => {
      if (!res.ok) throw new Error("Submission failed");
      return res.json();
    });
  }
  return api.put(`/api/assignments/${id}/submit`, {});
};

export const deleteAssignment = (id) =>
  api.delete(`/api/assignments/${id}`);
