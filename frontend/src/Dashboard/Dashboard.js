import React, { useState, useEffect } from "react";
import "./Dashboard.css";
import { Heart, CheckCircle, Plus, Pencil, Trash2, Calendar, BookOpen, Clock, GraduationCap } from "lucide-react"; // icons
import { fetchTutors, createTutor, deleteTutor, updateTutor } from "../api/tutors";
import { getStudentBookings, generateGoogleCalendarUrl } from "../api/bookings";
import { fetchCourses, createCourse, updateCourse, deleteCourse, getCourseTutors } from "../api/courses";
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "../api/students";
import { fetchGrades, createGrade, updateGrade, deleteGrade } from "../api/grades";
import { fetchPaymentsByStudent, createPayment, updatePayment, deletePayment } from "../api/payments";
import BookingComponent from "../Components/Booking";
import CalendarView from "../Components/Calendar";


const placeholderImg = "https://via.placeholder.com/150";

export default function Dashboard({ isAdmin = false }) {
  const [favorites, setFavorites] = useState([]);
  const [view, setView] = useState("dashboard");
  const [tutors, setTutors] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTutor, setNewTutor] = useState({ name: "", surname: "", bio: "", rate: "" });
  const [highlightedId, setHighlightedId] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTutor, setEditTutor] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseTutorsLoading, setCourseTutorsLoading] = useState(false);
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [courseTutors, setCourseTutors] = useState([]);
  const [showAddCourseForm, setShowAddCourseForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: "", description: "", category: "" });
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [deleteConfirmCourseId, setDeleteConfirmCourseId] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [showAddStudentForm, setShowAddStudentForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ first_name: "", last_name: "", email: "" });
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteConfirmStudentId, setDeleteConfirmStudentId] = useState(null);
  const [grades, setGrades] = useState([]);
  const [gradesLoading, setGradesLoading] = useState(false);
  const [showAddGradeForm, setShowAddGradeForm] = useState(false);
  const [newGrade, setNewGrade] = useState({ student_id: "", course_id: "", grade_value: "", comments: "" });
  const [isEditingGrade, setIsEditingGrade] = useState(false);
  const [editGrade, setEditGrade] = useState(null);
  const [deleteConfirmGradeId, setDeleteConfirmGradeId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [newPayment, setNewPayment] = useState({ amount: "", currency: "USD", method: "manual", reference: "" });
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [editPayment, setEditPayment] = useState(null);
  const [deleteConfirmPaymentId, setDeleteConfirmPaymentId] = useState(null);
  const role = localStorage.getItem("role");
  const studentId = localStorage.getItem("email") || localStorage.getItem("userId") || "student1";
  const tutorIdFromStorage = localStorage.getItem("tutorId");
  
  
  // Find tutor ID if user is a tutor
  const getTutorId = () => {
    if (role === "tutor") {
      // First try to get from localStorage
      if (tutorIdFromStorage) return tutorIdFromStorage;
      // If no tutors loaded yet, return null
      if (tutors.length === 0) return null;
      // Fallback: use first tutor's ID (for now)
      // In a real app, you'd match by email or store tutor ID during login
      return tutors[0].id;
    }
    return null;
  };

  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(savedFavorites);
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Load student bookings
  useEffect(() => {
    if (role === "student" && view === "bookings") {
      loadBookings();
    }
  }, [view, role]);

  // Load courses when Courses view is opened (admin or student)
  useEffect(() => {
    if (view === "courses") {
      loadCourses();
    }
  }, [view]);

  

  // Load students for admin
  useEffect(() => {
    if (isAdmin && view === "students") {
      loadStudents();
    }
  }, [view, isAdmin]);

  // Load grades for admin
  useEffect(() => {
    if (isAdmin && view === "grades") {
      loadGrades();
    }
  }, [view, isAdmin]);

  // Load payments for student (dashboard and payments view)
  useEffect(() => {
    if (!isAdmin && role === "student" && (view === "payments" || view === "dashboard")) {
      loadPayments();
    }
  }, [view, role, isAdmin]);

  const loadBookings = async () => {
    setBookingsLoading(true);
    try {
      const bookings = await getStudentBookings(studentId);
      setMyBookings(bookings);
    } catch (err) {
      console.error("Error loading bookings:", err);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    fetchTutors()
      .then((data) => {
        if (!isMounted) return;
        const normalized = (Array.isArray(data) ? data : []).map((t) => ({
          id: t.id ?? t._id ?? Math.random().toString(36).slice(2),
          name: t.name || "",
          surname: t.surname || "",
          bio: t.bio || "",
          rate: Number(t.rate ?? t.price ?? 0),
          img: t.img || placeholderImg
        }));
        setTutors(normalized);
      })
      .catch((err) => {
        if (!isMounted) return;
        const message = String(err?.message || "Failed to load tutors");
        setError(message.includes("401") ? "Authorization error: please log in again." : message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const validateForm = (tutor) => {
    const errors = {};
    if (!tutor.name || tutor.name.trim() === "") {
      errors.name = "Name is required";
    }
    if (!tutor.surname || tutor.surname.trim() === "") {
      errors.surname = "Surname is required";
    }
    if (tutor.rate && (isNaN(tutor.rate) || parseFloat(tutor.rate) < 0)) {
      errors.rate = "Rate must be a positive number";
    }
    return errors;
  };

  const handleAddTutor = async (e) => {
    e.preventDefault();
    setFormErrors({});
    
    const errors = validateForm(newTutor);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      name: newTutor.name.trim(),
      surname: newTutor.surname.trim(),
      bio: newTutor.bio?.trim() || "",
      rate: newTutor.rate ? parseFloat(newTutor.rate) : 0,
      img: placeholderImg
    };
    try {
      const created = await createTutor(payload);
      const createdId = created.id ?? created._id ?? Math.random().toString(36).slice(2);
      
      // Refresh the tutors list from the server
      const updatedTutors = await fetchTutors();
      const normalized = (Array.isArray(updatedTutors) ? updatedTutors : []).map((t) => ({
        id: t.id ?? t._id ?? Math.random().toString(36).slice(2),
        name: t.name || "",
        surname: t.surname || "",
        bio: t.bio || "",
        rate: Number(t.rate ?? t.price ?? 0),
        img: t.img || placeholderImg
      }));
      setTutors(normalized);
      
      setHighlightedId(createdId);
      setNewTutor({ name: "", surname: "", bio: "", rate: "" });
      setShowAddForm(false);
      setSuccessMessage(`Tutor "${payload.name} ${payload.surname}" added successfully!`);
      setTimeout(() => {
        setHighlightedId(null);
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error adding tutor:", err);
      const message = String(err?.message || "Failed to add tutor");
      const errorMsg = message.includes("401") 
        ? "Authorization error: invalid or missing token." 
        : message.includes("Failed to fetch") || message.includes("NetworkError")
        ? "Cannot connect to server. Please make sure the backend server is running on port 5000."
        : message;
      setError(errorMsg);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleRemoveTutor = async (id) => {
    const tutorToDelete = tutors.find(t => t.id === id);
    const previous = tutors;
    setTutors(tutors.filter((tutor) => tutor.id !== id));
    setFavorites(favorites.filter((favId) => favId !== id));
    if (selectedTutor && selectedTutor.id === id) setSelectedTutor(null);
    setDeleteConfirmId(null);
    try {
      await deleteTutor(id);
      setSuccessMessage(`Tutor "${tutorToDelete?.name} ${tutorToDelete?.surname}" deleted successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setTutors(previous);
      const message = String(err?.message || "Failed to remove tutor");
      setError(message.includes("401") ? "Authorization error: invalid or missing token." : message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const startEditTutor = (tutor) => {
    setIsEditing(true);
    setEditTutor({ ...tutor });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditTutor(null);
  };

  const handleUpdateTutor = async (e) => {
    e.preventDefault();
    if (!editTutor) return;
    setFormErrors({});
    
    const errors = validateForm(editTutor);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const id = editTutor.id;
    const payload = {
      name: editTutor.name.trim(),
      surname: editTutor.surname.trim(),
      bio: editTutor.bio?.trim() || "",
      rate: editTutor.rate ? parseFloat(editTutor.rate) : 0,
      img: editTutor.img || placeholderImg
    };
    try {
      const updated = await updateTutor(id, payload);
      const updatedId = updated.id ?? updated._id ?? id;
      const normalized = { ...payload, id: updatedId };
      setTutors((prev) => prev.map((t) => (t.id === id ? normalized : t)));
      setIsEditing(false);
      setEditTutor(null);
      setHighlightedId(updatedId);
      setSuccessMessage(`Tutor "${payload.name} ${payload.surname}" updated successfully!`);
      setTimeout(() => {
        setHighlightedId(null);
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      const message = String(err?.message || "Failed to update tutor");
      setError(message.includes("401") ? "Authorization error: invalid or missing token." : message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      const data = await fetchCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading courses:", err);
      setError(err.message || "Failed to load courses");
      setTimeout(() => setError(null), 5000);
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadTutorsForCourse = async (courseId) => {
    setCourseTutorsLoading(true);
    try {
      const tutors = await getCourseTutors(courseId);
      const normalized = (Array.isArray(tutors) ? tutors : []).map((t) => ({
        id: t.id ?? t._id ?? Math.random().toString(36).slice(2),
        name: t.name || "",
        surname: t.surname || "",
        bio: t.bio || "",
        rate: Number(t.rate ?? t.price ?? 0),
        img: t.img || placeholderImg
      }));
      setCourseTutors(normalized);
    } catch (err) {
      console.error("Error loading course tutors:", err);
      setError(err.message || "Failed to load tutors for course");
      setTimeout(() => setError(null), 5000);
    } finally {
      setCourseTutorsLoading(false);
    }
  };

  const loadStudents = async () => {
    setStudentsLoading(true);
    try {
      const data = await fetchStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading students:", err);
      setError(err.message || "Failed to load students");
      setTimeout(() => setError(null), 5000);
    } finally {
      setStudentsLoading(false);
    }
  };

  const loadGrades = async () => {
    setGradesLoading(true);
    try {
      const data = await fetchGrades();
      setGrades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading grades:", err);
      setError(err.message || "Failed to load grades");
      setTimeout(() => setError(null), 5000);
    } finally {
      setGradesLoading(false);
    }
  };

  const loadPayments = async () => {
    setPaymentsLoading(true);
    try {
      const data = await fetchPaymentsByStudent(studentId);
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading payments:", err);
      setError(err.message || "Failed to load payments");
      setTimeout(() => setError(null), 5000);
    } finally {
      setPaymentsLoading(false);
    }
  };

  

  const validateCourseForm = (course) => {
    const errors = {};
    if (!course.name || course.name.trim() === "") {
      errors.name = "Course name is required";
    }
    return errors;
  };

  const validateStudentForm = (s) => {
    const errors = {};
    if (!s.first_name || s.first_name.trim() === "") errors.first_name = "First name is required";
    if (!s.last_name || s.last_name.trim() === "") errors.last_name = "Last name is required";
    if (!s.email || s.email.trim() === "") errors.email = "Email is required";
    return errors;
  };

  const validateGradeForm = (g) => {
    const errors = {};
    if (!g.student_id) errors.student_id = "Student is required";
    if (!g.grade_value || String(g.grade_value).trim() === "") errors.grade_value = "Grade is required";
    return errors;
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    const errors = validateCourseForm(newCourse);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const created = await createCourse({
        name: newCourse.name.trim(),
        description: newCourse.description || "",
        category: newCourse.category || ""
      });
      setCourses([...courses, created]);
      setShowAddCourseForm(false);
      setNewCourse({ name: "", description: "", category: "" });
      setFormErrors({});
      setSuccessMessage(`Course "${created.name}" added successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error adding course:", err);
      const errorMessage = err.message || "Failed to add course";
      setError(errorMessage);
      setTimeout(() => setError(null), 7000);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    const errors = validateCourseForm(editCourse);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const updated = await updateCourse(editCourse.id, {
        name: editCourse.name.trim(),
        description: editCourse.description || "",
        category: editCourse.category || ""
      });
      setCourses(courses.map(c => c.id === updated.id ? updated : c));
      setIsEditingCourse(false);
      setEditCourse(null);
      setFormErrors({});
      setSuccessMessage(`Course "${updated.name}" updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to update course");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteCourse(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
      setDeleteConfirmCourseId(null);
      setSuccessMessage("Course deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete course");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Students CRUD
  const handleAddStudent = async (e) => {
    e.preventDefault();
    const errors = validateStudentForm(newStudent);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    try {
      const created = await createStudent({
        first_name: newStudent.first_name.trim(),
        last_name: newStudent.last_name.trim(),
        email: newStudent.email.trim()
      });
      setStudents([...students, created]);
      setShowAddStudentForm(false);
      setNewStudent({ first_name: "", last_name: "", email: "" });
      setFormErrors({});
      setSuccessMessage(`Student "${created.first_name} ${created.last_name}" added successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to add student");
      setTimeout(() => setError(null), 5000);
    }
  };

  const startEditStudent = (s) => {
    setEditStudent({ ...s });
    setIsEditingStudent(true);
    setShowAddStudentForm(false);
    setFormErrors({});
  };

  const cancelEditStudent = () => {
    setIsEditingStudent(false);
    setEditStudent(null);
    setFormErrors({});
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    const errors = validateStudentForm(editStudent);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    try {
      const updated = await updateStudent(editStudent.id, {
        first_name: editStudent.first_name.trim(),
        last_name: editStudent.last_name.trim(),
        email: editStudent.email.trim()
      });
      setStudents(students.map(s => s.id === updated.id ? updated : s));
      setIsEditingStudent(false);
      setEditStudent(null);
      setFormErrors({});
      setSuccessMessage(`Student "${updated.first_name} ${updated.last_name}" updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to update student");
      setTimeout(() => setError(null), 5000);
    }
  };

  const confirmDeleteStudent = (id) => setDeleteConfirmStudentId(id);
  const cancelDeleteStudent = () => setDeleteConfirmStudentId(null);
  const handleDeleteStudent = async (id) => {
    try {
      await deleteStudent(id);
      setStudents(students.filter(s => s.id !== id));
      setDeleteConfirmStudentId(null);
      setSuccessMessage("Student deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete student");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Grades CRUD
  const handleAddGrade = async (e) => {
    e.preventDefault();
    const errors = validateGradeForm(newGrade);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    try {
      const created = await createGrade({
        student_id: Number(newGrade.student_id),
        course_id: newGrade.course_id ? Number(newGrade.course_id) : null,
        grade_value: String(newGrade.grade_value),
        comments: newGrade.comments || ""
      });
      setGrades([created, ...grades]);
      setShowAddGradeForm(false);
      setNewGrade({ student_id: "", course_id: "", grade_value: "", comments: "" });
      setFormErrors({});
      setSuccessMessage("Grade added successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to add grade");
      setTimeout(() => setError(null), 5000);
    }
  };

  const startEditGrade = (g) => {
    setEditGrade({ ...g });
    setIsEditingGrade(true);
    setShowAddGradeForm(false);
    setFormErrors({});
  };

  const cancelEditGrade = () => {
    setIsEditingGrade(false);
    setEditGrade(null);
    setFormErrors({});
  };

  const handleUpdateGrade = async (e) => {
    e.preventDefault();
    const errors = validateGradeForm(editGrade);
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
    try {
      const updated = await updateGrade(editGrade.id, {
        student_id: Number(editGrade.student_id),
        course_id: editGrade.course_id ? Number(editGrade.course_id) : null,
        grade_value: String(editGrade.grade_value),
        comments: editGrade.comments || ""
      });
      setGrades(grades.map(g => g.id === updated.id ? updated : g));
      setIsEditingGrade(false);
      setEditGrade(null);
      setFormErrors({});
      setSuccessMessage("Grade updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to update grade");
      setTimeout(() => setError(null), 5000);
    }
  };

  const confirmDeleteGrade = (id) => setDeleteConfirmGradeId(id);
  const cancelDeleteGrade = () => setDeleteConfirmGradeId(null);
  const handleDeleteGrade = async (id) => {
    try {
      await deleteGrade(id);
      setGrades(grades.filter(g => g.id !== id));
      setDeleteConfirmGradeId(null);
      setSuccessMessage("Grade deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete grade");
      setTimeout(() => setError(null), 5000);
    }
  };

  const confirmDeleteCourse = (courseId) => {
    setDeleteConfirmCourseId(courseId);
  };

  const cancelDeleteCourse = () => {
    setDeleteConfirmCourseId(null);
  };

  const startEditCourse = (course) => {
    setEditCourse({ ...course });
    setIsEditingCourse(true);
    setShowAddCourseForm(false);
    setFormErrors({});
  };

  const cancelEditCourse = () => {
    setIsEditingCourse(false);
    setEditCourse(null);
    setFormErrors({});
  };

  const likedTutors = tutors.filter((tutor) => favorites.includes(tutor.id));

  return (
    <div className="dashboard-container menu-dashboard-container">
      <aside className="sidebar">
        <h2>Dashboard</h2>
        <ul>
          <li onClick={() => setView("dashboard")}>Home</li>
          <li onClick={() => setView("profile")}>My Favorites</li>
          {(role === "student" || role === "tutor") && (
            <li onClick={() => setView("calendar")}>
              <Calendar size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Calendar
            </li>
          )}

        

        {/* Payments view (Student) */}
        {!selectedTutor && view === "payments" && role === "student" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 className="section-title">My Payments</h2>
              <button
                className="add-button"
                onClick={() => { setShowAddPaymentForm(!showAddPaymentForm); setIsEditingPayment(false); setEditPayment(null); setFormErrors({}); }}
              >
                <Plus size={16} style={{ marginRight: 6 }} /> Add Payment
              </button>
            </div>

            {showAddPaymentForm && !isEditingPayment && (
              <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Add Payment</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newPayment.amount) { setFormErrors({ amount: "Amount is required" }); return; }
                  try {
                    const created = await createPayment({
                      student_id: studentId,
                      amount: Number(newPayment.amount),
                      currency: newPayment.currency || "USD",
                      method: newPayment.method || "manual",
                      reference: newPayment.reference || "",
                      status: "paid"
                    });
                    setPayments([created, ...payments]);
                    setShowAddPaymentForm(false);
                    setNewPayment({ amount: "", currency: "USD", method: "manual", reference: "" });
                    setFormErrors({});
                    setSuccessMessage("Payment added successfully!");
                    setTimeout(() => setSuccessMessage(null), 3000);
                  } catch (err) {
                    setError(err.message || "Failed to add payment");
                    setTimeout(() => setError(null), 5000);
                  }
                }}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <input type="number" min="0" step="0.01" placeholder="Amount *" value={newPayment.amount} onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })} style={{ flex: 1, minWidth: 160, padding: 10 }} />
                    <input type="text" placeholder="Currency" value={newPayment.currency} onChange={(e) => setNewPayment({ ...newPayment, currency: e.target.value })} style={{ flex: 1, minWidth: 120, padding: 10 }} />
                    <input type="text" placeholder="Method" value={newPayment.method} onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })} style={{ flex: 1, minWidth: 140, padding: 10 }} />
                    <input type="text" placeholder="Reference" value={newPayment.reference} onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })} style={{ flex: 2, minWidth: 200, padding: 10 }} />
                  </div>
                  {Object.values(formErrors || {}).length > 0 && (
                    <p style={{ color: "#e11d48", marginTop: 8 }}>{Object.values(formErrors).join(" • ")}</p>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                    <button type="button" onClick={() => { setShowAddPaymentForm(false); setNewPayment({ amount: "", currency: "USD", method: "manual", reference: "" }); setFormErrors({}); }}>Cancel</button>
                    <button type="submit" className="add-button">Add Payment</button>
                  </div>
                </form>
              </div>
            )}

            {isEditingPayment && editPayment && (
              <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Edit Payment</h3>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!editPayment.amount) { setFormErrors({ amount: "Amount is required" }); return; }
                  try {
                    const updated = await updatePayment(editPayment.id, {
                      student_id: studentId,
                      amount: Number(editPayment.amount),
                      currency: editPayment.currency || "USD",
                      method: editPayment.method || "manual",
                      reference: editPayment.reference || "",
                      status: editPayment.status || "paid"
                    });
                    setPayments(payments.map(p => p.id === updated.id ? updated : p));
                    setIsEditingPayment(false);
                    setEditPayment(null);
                    setFormErrors({});
                    setSuccessMessage("Payment updated successfully!");
                    setTimeout(() => setSuccessMessage(null), 3000);
                  } catch (err) {
                    setError(err.message || "Failed to update payment");
                    setTimeout(() => setError(null), 5000);
                  }
                }}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <input type="number" min="0" step="0.01" placeholder="Amount *" value={editPayment.amount} onChange={(e) => setEditPayment({ ...editPayment, amount: e.target.value })} style={{ flex: 1, minWidth: 160, padding: 10 }} />
                    <input type="text" placeholder="Currency" value={editPayment.currency || ""} onChange={(e) => setEditPayment({ ...editPayment, currency: e.target.value })} style={{ flex: 1, minWidth: 120, padding: 10 }} />
                    <input type="text" placeholder="Method" value={editPayment.method || ""} onChange={(e) => setEditPayment({ ...editPayment, method: e.target.value })} style={{ flex: 1, minWidth: 140, padding: 10 }} />
                    <input type="text" placeholder="Reference" value={editPayment.reference || ""} onChange={(e) => setEditPayment({ ...editPayment, reference: e.target.value })} style={{ flex: 2, minWidth: 200, padding: 10 }} />
                  </div>
                  {Object.values(formErrors || {}).length > 0 && (
                    <p style={{ color: "#e11d48", marginTop: 8 }}>{Object.values(formErrors).join(" • ")}</p>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                    <button type="button" onClick={() => { setIsEditingPayment(false); setEditPayment(null); setFormErrors({}); }}>Cancel</button>
                    <button type="submit" className="add-button">Save Changes</button>
                  </div>
                </form>
              </div>
            )}

            {paymentsLoading ? (
              <p>Loading payments...</p>
            ) : payments.length === 0 ? (
              <p>No payments yet.</p>
            ) : (
              <div className="bookings-list">
                {payments.map((p) => (
                  <div key={p.id} className="booking-card">
                    <div className="booking-header">
                      <div>
                        <h3>Payment #{p.id}</h3>
                        <p className="booking-status">{p.status || 'paid'} • {p.currency || 'USD'} {Number(p.amount).toFixed(2)}</p>
                      </div>
                    </div>
                    {p.reference && (
                      <div className="booking-notes"><strong>Reference:</strong> {p.reference}</div>
                    )}
                    <div className="booking-actions-list">
                      <button className="view-profile-btn" onClick={() => { setEditPayment({ ...p }); setIsEditingPayment(true); setShowAddPaymentForm(false); }}><Pencil size={14} /> Edit</button>
                      <button className="remove-button" onClick={() => setDeleteConfirmPaymentId(p.id)}><Trash2 size={14} /> Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {deleteConfirmPaymentId && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                <div style={{ background: "#fff", padding: 24, borderRadius: 12, maxWidth: 400, width: "90%" }}>
                  <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
                  <p>Are you sure you want to delete this payment?</p>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={() => setDeleteConfirmPaymentId(null)}>Cancel</button>
                    <button onClick={async () => {
                      try {
                        await deletePayment(deleteConfirmPaymentId);
                        setPayments(payments.filter(x => x.id !== deleteConfirmPaymentId));
                        setDeleteConfirmPaymentId(null);
                        setSuccessMessage("Payment deleted successfully!");
                        setTimeout(() => setSuccessMessage(null), 3000);
                      } catch (err) {
                        setError(err.message || "Failed to delete payment");
                        setTimeout(() => setError(null), 5000);
                      }
                    }} style={{ background: "#b91c1c", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6 }}>Delete</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
          {role === "student" && (
            <li onClick={() => setView("bookings")}>
              <BookOpen size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              My Bookings
            </li>
          )}
          {isAdmin && (
            <li onClick={() => setView("courses")}>
              <GraduationCap size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Courses
            </li>
          )}
          {role === "student" && (
            <li onClick={() => setView("courses")}>
              <GraduationCap size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Courses
            </li>
          )}
          {isAdmin && (
            <li onClick={() => setView("tutors")}>
              <GraduationCap size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Tutors
            </li>
          )}
          {isAdmin && (
            <li onClick={() => setView("students")}>
              <GraduationCap size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Students
            </li>
          )}
          {isAdmin && (
            <li onClick={() => setView("grades")}>
              <GraduationCap size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Grades
            </li>
          )}
        </ul>
      </aside>

      <main className="main-content">
        {loading && <p>Loading tutors...</p>}
        {error && (
          <div style={{ 
            background: "#fee2e2", 
            color: "#b91c1c", 
            padding: "12px 16px", 
            borderRadius: "8px", 
            marginBottom: "16px",
            border: "1px solid #fecaca"
          }}>
            {error}
          </div>
        )}
        {successMessage && (
          <div style={{ 
            background: "#d1fae5", 
            color: "#065f46", 
            padding: "12px 16px", 
            borderRadius: "8px", 
            marginBottom: "16px",
            border: "1px solid #a7f3d0"
          }}>
            {successMessage}
          </div>
        )}

        {/* Profile view */}
        {selectedTutor && (
          <div className="tutor-profile">
            <button onClick={() => setSelectedTutor(null)} className="view-profile-btn">← Back</button>
            <div className="tutor-profile-header">
              <img src={selectedTutor.img} alt={selectedTutor.name} className="tutor-avatar-large" />
              <div>
                <h2>
                  {selectedTutor.name} {selectedTutor.surname}
                </h2>
                <div className="tutor-rating">
                  <Heart
                    size={26}
                    color={favorites.includes(selectedTutor.id) ? "#e63946" : "#bbb"}
                    fill={favorites.includes(selectedTutor.id) ? "#e63946" : "none"}
                    onClick={() => toggleFavorite(selectedTutor.id)}
                  />
                </div>
              </div>
            </div>
            <p>{selectedTutor.bio}</p>
            <p style={{ marginTop: "12px", fontWeight: "600", color: "#0284c7" }}>
              Rate: ${selectedTutor.rate}/hour
            </p>
            {role === "student" && (
              <button 
                className="book-btn" 
                onClick={() => setShowBookingModal(true)}
                style={{ marginTop: "16px", width: "100%" }}
              >
                <Calendar size={18} style={{ marginRight: 8, verticalAlign: "middle" }} />
                Book a Lesson
              </button>
            )}
            {isAdmin && <button className="remove-button" onClick={() => confirmDelete(selectedTutor.id)}>Remove Tutor</button>}
          </div>
        )}

        {/* Booking Modal */}
        {showBookingModal && selectedTutor && (
          <BookingComponent
            tutor={selectedTutor}
            onClose={() => {
              setShowBookingModal(false);
              if (view === "bookings") {
                loadBookings();
              }
            }}
            studentId={studentId}
          />
        )}

        

        {/* Courses view (Student read-only) */}
        {!selectedTutor && view === "courses" && !isAdmin && (
          <>
            <h2 className="section-title">Courses</h2>
            {coursesLoading ? (
              <p>Loading courses...</p>
            ) : courses.length === 0 ? (
              <p>No courses available yet.</p>
            ) : (
              <div className="tutor-list">
                {courses.map((c) => (
                  <div key={c.id} className="tutor-card" style={{ cursor: "default" }}>
                    <div className="tutor-details">
                      <h3>{c.name}</h3>
                      {c.category && <p style={{ fontWeight: 600, color: "#0284c7" }}>{c.category}</p>}
                      {c.description && <p>{c.description}</p>}
                      <div style={{ marginTop: 12 }}>
                        <button 
                          className="view-profile-btn"
                          onClick={async () => {
                            const next = expandedCourseId === c.id ? null : c.id;
                            setExpandedCourseId(next);
                            setCourseTutors([]);
                            if (next) await loadTutorsForCourse(c.id);
                          }}
                        >
                          {expandedCourseId === c.id ? 'Hide Tutors' : 'View Tutors'}
                        </button>
                      </div>
                      {expandedCourseId === c.id && (
                        <div style={{ marginTop: 12 }}>
                          {courseTutorsLoading ? (
                            <p>Loading tutors...</p>
                          ) : courseTutors.length === 0 ? (
                            <p>No tutors available for this course yet.</p>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                              {courseTutors.map(t => (
                                <div key={t.id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 12, background: '#fff' }}>
                                  <div style={{ fontWeight: 600 }}>{t.name} {t.surname}</div>
                                  <div style={{ color: '#6b7280', fontSize: 14, margin: '6px 0' }}>{t.bio}</div>
                                  <div style={{ fontSize: 14, marginBottom: 8 }}>Rate: ${t.rate}/hr</div>
                                  <button 
                                    className="add-button"
                                    onClick={() => { setSelectedTutor(t); setShowBookingModal(true); }}
                                  >
                                    Book with {t.name}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Tutors Management view (Admin only) */}
        {!selectedTutor && view === "tutors" && isAdmin && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 className="section-title">Manage Tutors</h2>
              <button
                className="add-button"
                onClick={() => { setShowAddForm(!showAddForm); setIsEditing(false); setEditTutor(null); setFormErrors({}); }}
              >
                <Plus size={16} style={{ marginRight: 6 }} /> Add Tutor
              </button>
            </div>

            {showAddForm && !isEditing && (
              <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Add New Tutor</h3>
                <form onSubmit={handleAddTutor}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <input type="text" placeholder="First Name *" value={newTutor.name} onChange={(e) => setNewTutor({ ...newTutor, name: e.target.value })} style={{ flex: 1, minWidth: 200, padding: 10 }} />
                    <input type="text" placeholder="Last Name *" value={newTutor.surname} onChange={(e) => setNewTutor({ ...newTutor, surname: e.target.value })} style={{ flex: 1, minWidth: 200, padding: 10 }} />
                    <input type="number" min="0" step="0.01" placeholder="Rate (per hour)" value={newTutor.rate} onChange={(e) => setNewTutor({ ...newTutor, rate: e.target.value })} style={{ flex: 1, minWidth: 160, padding: 10 }} />
                    <input type="text" placeholder="Short Bio" value={newTutor.bio} onChange={(e) => setNewTutor({ ...newTutor, bio: e.target.value })} style={{ flex: 2, minWidth: 240, padding: 10 }} />
                  </div>
                  {Object.values(formErrors || {}).length > 0 && (
                    <p style={{ color: "#e11d48", marginTop: 8 }}>{Object.values(formErrors).join(" • ")}</p>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                    <button type="button" onClick={() => { setShowAddForm(false); setNewTutor({ name: "", surname: "", bio: "", rate: "" }); setFormErrors({}); }}>Cancel</button>
                    <button type="submit" className="add-button">Add Tutor</button>
                  </div>
                </form>
              </div>
            )}

            {isEditing && editTutor && (
              <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Edit Tutor</h3>
                <form onSubmit={handleUpdateTutor}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <input type="text" placeholder="First Name *" value={editTutor.name} onChange={(e) => setEditTutor({ ...editTutor, name: e.target.value })} style={{ flex: 1, minWidth: 200, padding: 10 }} />
                    <input type="text" placeholder="Last Name *" value={editTutor.surname} onChange={(e) => setEditTutor({ ...editTutor, surname: e.target.value })} style={{ flex: 1, minWidth: 200, padding: 10 }} />
                    <input type="number" min="0" step="0.01" placeholder="Rate (per hour)" value={editTutor.rate} onChange={(e) => setEditTutor({ ...editTutor, rate: e.target.value })} style={{ flex: 1, minWidth: 160, padding: 10 }} />
                    <input type="text" placeholder="Short Bio" value={editTutor.bio || ""} onChange={(e) => setEditTutor({ ...editTutor, bio: e.target.value })} style={{ flex: 2, minWidth: 240, padding: 10 }} />
                  </div>
                  {Object.values(formErrors || {}).length > 0 && (
                    <p style={{ color: "#e11d48", marginTop: 8 }}>{Object.values(formErrors).join(" • ")}</p>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                    <button type="button" onClick={cancelEdit}>Cancel</button>
                    <button type="submit" className="add-button">Save Changes</button>
                  </div>
                </form>
              </div>
            )}

            <div className="tutor-list">
              {tutors.map((t) => (
                <div key={t.id} className="tutor-card" style={{ cursor: "default" }}>
                  <div className="tutor-details">
                    <h3>{t.name} {t.surname}</h3>
                    <p className="tutor-subject" style={{ marginTop: 4 }}>Rate: ${Number(t.rate).toFixed(2)}/hr</p>
                    {t.bio && <p className="tutor-bio" style={{ marginTop: 8 }}>{t.bio}</p>}
                  </div>
                  <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
                    <button title="Edit" style={{ background: "#111", color: "#fff", border: "none", borderRadius: 6, padding: "4px 6px", cursor: "pointer" }} onClick={() => startEditTutor(t)}>
                      <Pencil size={14} />
                    </button>
                    <button title="Delete" style={{ background: "#b91c1c", color: "#fff", border: "none", borderRadius: 6, padding: "4px 6px", cursor: "pointer" }} onClick={() => confirmDelete(t.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Students Management view (Admin only) */}
        {!selectedTutor && view === "students" && isAdmin && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 className="section-title">Manage Students</h2>
              <button
                className="add-button"
                onClick={() => { setShowAddStudentForm(!showAddStudentForm); setIsEditingStudent(false); setEditStudent(null); setFormErrors({}); }}
              >
                <Plus size={16} style={{ marginRight: 6 }} /> Add Student
              </button>
            </div>

            {showAddStudentForm && !isEditingStudent && (
              <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Add New Student</h3>
                <form onSubmit={handleAddStudent}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <input type="text" placeholder="First Name *" value={newStudent.first_name} onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })} style={{ flex: 1, minWidth: 200, padding: 10 }} />
                    <input type="text" placeholder="Last Name *" value={newStudent.last_name} onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })} style={{ flex: 1, minWidth: 200, padding: 10 }} />
                    <input type="email" placeholder="Email *" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} style={{ flex: 1, minWidth: 240, padding: 10 }} />
                  </div>
                  {Object.values(formErrors || {}).length > 0 && (
                    <p style={{ color: "#e11d48", marginTop: 8 }}>{Object.values(formErrors).join(" • ")}</p>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                    <button type="button" onClick={() => { setShowAddStudentForm(false); setNewStudent({ first_name: "", last_name: "", email: "" }); setFormErrors({}); }}>Cancel</button>
                    <button type="submit" className="add-button">Add Student</button>
                  </div>
                </form>
              </div>
            )}

            {isEditingStudent && editStudent && (
              <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Edit Student</h3>
                <form onSubmit={handleUpdateStudent}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <input type="text" placeholder="First Name *" value={editStudent.first_name} onChange={(e) => setEditStudent({ ...editStudent, first_name: e.target.value })} style={{ flex: 1, minWidth: 200, padding: 10 }} />
                    <input type="text" placeholder="Last Name *" value={editStudent.last_name} onChange={(e) => setEditStudent({ ...editStudent, last_name: e.target.value })} style={{ flex: 1, minWidth: 200, padding: 10 }} />
                    <input type="email" placeholder="Email *" value={editStudent.email} onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })} style={{ flex: 1, minWidth: 240, padding: 10 }} />
                  </div>
                  {Object.values(formErrors || {}).length > 0 && (
                    <p style={{ color: "#e11d48", marginTop: 8 }}>{Object.values(formErrors).join(" • ")}</p>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                    <button type="button" onClick={cancelEditStudent}>Cancel</button>
                    <button type="submit" className="add-button">Save Changes</button>
                  </div>
                </form>
              </div>
            )}

            {studentsLoading ? (
              <p>Loading students...</p>
            ) : (
              <div className="tutor-list">
                {students.map((s) => (
                  <div key={s.id} className="tutor-card" style={{ cursor: "default" }}>
                    <div className="tutor-details">
                      <h3>{s.first_name} {s.last_name}</h3>
                      <p>{s.email}</p>
                    </div>
                    {isAdmin && (
                      <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
                        <button title="Edit" style={{ background: "#111", color: "#fff", border: "none", borderRadius: 6, padding: "4px 6px", cursor: "pointer" }} onClick={() => startEditStudent(s)}>
                          <Pencil size={14} />
                        </button>
                        <button title="Delete" style={{ background: "#b91c1c", color: "#fff", border: "none", borderRadius: 6, padding: "4px 6px", cursor: "pointer" }} onClick={() => confirmDeleteStudent(s.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {deleteConfirmStudentId && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                <div style={{ background: "#fff", padding: 24, borderRadius: 12, maxWidth: 400, width: "90%" }}>
                  <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
                  <p>Are you sure you want to delete this student?</p>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={cancelDeleteStudent}>Cancel</button>
                    <button onClick={() => handleDeleteStudent(deleteConfirmStudentId)} style={{ background: "#b91c1c", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6 }}>Delete</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Grades Management view (Admin only) */}
        {!selectedTutor && view === "grades" && isAdmin && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 className="section-title">Manage Grades</h2>
              <button
                className="add-button"
                onClick={() => { setShowAddGradeForm(!showAddGradeForm); setIsEditingGrade(false); setEditGrade(null); setFormErrors({}); if (students.length === 0) loadStudents(); if (courses.length === 0) loadCourses(); }}
              >
                <Plus size={16} style={{ marginRight: 6 }} /> Add Grade
              </button>
            </div>

            {showAddGradeForm && !isEditingGrade && (
              <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Add New Grade</h3>
                <form onSubmit={handleAddGrade}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <select value={newGrade.student_id} onChange={(e) => setNewGrade({ ...newGrade, student_id: e.target.value })} style={{ flex: 1, minWidth: 200, padding: 10 }}>
                      <option value="">Select Student *</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                    </select>
                    <select value={newGrade.course_id} onChange={(e) => setNewGrade({ ...newGrade, course_id: e.target.value })} style={{ flex: 1, minWidth: 200, padding: 10 }}>
                      <option value="">(Optional) Course</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="text" placeholder="Grade (e.g., A, 95) *" value={newGrade.grade_value} onChange={(e) => setNewGrade({ ...newGrade, grade_value: e.target.value })} style={{ flex: 1, minWidth: 160, padding: 10 }} />
                    <input type="text" placeholder="Comments" value={newGrade.comments} onChange={(e) => setNewGrade({ ...newGrade, comments: e.target.value })} style={{ flex: 2, minWidth: 240, padding: 10 }} />
                  </div>
                  {Object.values(formErrors || {}).length > 0 && (
                    <p style={{ color: "#e11d48", marginTop: 8 }}>{Object.values(formErrors).join(" • ")}</p>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                    <button type="button" onClick={() => { setShowAddGradeForm(false); setNewGrade({ student_id: "", course_id: "", grade_value: "", comments: "" }); setFormErrors({}); }}>Cancel</button>
                    <button type="submit" className="add-button">Add Grade</button>
                  </div>
                </form>
              </div>
            )}

            {isEditingGrade && editGrade && (
              <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Edit Grade</h3>
                <form onSubmit={handleUpdateGrade}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <select value={editGrade.student_id} onChange={(e) => setEditGrade({ ...editGrade, student_id: e.target.value })} style={{ flex: 1, minWidth: 200, padding: 10 }}>
                      <option value="">Select Student *</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                    </select>
                    <select value={editGrade.course_id || ""} onChange={(e) => setEditGrade({ ...editGrade, course_id: e.target.value })} style={{ flex: 1, minWidth: 200, padding: 10 }}>
                      <option value="">(Optional) Course</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="text" placeholder="Grade (e.g., A, 95) *" value={editGrade.grade_value} onChange={(e) => setEditGrade({ ...editGrade, grade_value: e.target.value })} style={{ flex: 1, minWidth: 160, padding: 10 }} />
                    <input type="text" placeholder="Comments" value={editGrade.comments || ""} onChange={(e) => setEditGrade({ ...editGrade, comments: e.target.value })} style={{ flex: 2, minWidth: 240, padding: 10 }} />
                  </div>
                  {Object.values(formErrors || {}).length > 0 && (
                    <p style={{ color: "#e11d48", marginTop: 8 }}>{Object.values(formErrors).join(" • ")}</p>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                    <button type="button" onClick={cancelEditGrade}>Cancel</button>
                    <button type="submit" className="add-button">Save Changes</button>
                  </div>
                </form>
              </div>
            )}

            {gradesLoading ? (
              <p>Loading grades...</p>
            ) : (
              <div className="bookings-list">
                {grades.map((g) => (
                  <div key={g.id} className="booking-card">
                    <div className="booking-header">
                      <div>
                        <h3>{g.student_first_name ? `${g.student_first_name} ${g.student_last_name}` : `Student #${g.student_id}`}</h3>
                        <p className="booking-status">{g.course_name ? g.course_name : "No course"} • Grade: {g.grade_value}</p>
                      </div>
                    </div>
                    {g.comments && (
                      <div className="booking-notes"><strong>Comments:</strong> {g.comments}</div>
                    )}
                    <div className="booking-actions-list">
                      <button title="Edit" className="view-profile-btn" onClick={() => startEditGrade(g)}><Pencil size={14} /> Edit</button>
                      <button title="Delete" className="remove-button" onClick={() => confirmDeleteGrade(g.id)}><Trash2 size={14} /> Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {deleteConfirmGradeId && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                <div style={{ background: "#fff", padding: 24, borderRadius: 12, maxWidth: 400, width: "90%" }}>
                  <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
                  <p>Are you sure you want to delete this grade?</p>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={cancelDeleteGrade}>Cancel</button>
                    <button onClick={() => handleDeleteGrade(deleteConfirmGradeId)} style={{ background: "#b91c1c", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6 }}>Delete</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}>
            <div style={{
              background: "#fff",
              padding: "30px",
              borderRadius: "12px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
            }}>
              <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Confirm Delete</h3>
              <p style={{ marginBottom: "20px", color: "#666" }}>
                Are you sure you want to delete this tutor? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  onClick={cancelDelete}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: "16px"
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveTutor(deleteConfirmId)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#b91c1c",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "600"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Favorites view */}
        {!selectedTutor && view === "profile" && (
          <>
            <h2 className="section-title">My Favorites</h2>
            {likedTutors.length === 0 ? (
              <p>You haven't liked any tutors yet!</p>
            ) : (
              <div className="tutor-list">
                {likedTutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="tutor-card"
                    onClick={() => setSelectedTutor(tutor)}
                  >
                    <div className="favorite-icon" onClick={(e) => { e.stopPropagation(); toggleFavorite(tutor.id); }}>
                      <Heart size={26} color={favorites.includes(tutor.id) ? "#e63946" : "#bbb"} fill={favorites.includes(tutor.id) ? "#e63946" : "none"} />
                    </div>
                    <img src={tutor.img} alt={tutor.name} className="tutor-img" />
                    <div className="tutor-details">
                      <h3>{tutor.name} {tutor.surname}</h3>
                      <p>{tutor.bio}</p>
                      <p>Price: ${tutor.rate}/hr</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* My Bookings view */}
        {!selectedTutor && view === "bookings" && role === "student" && (
          <>
            <h2 className="section-title">My Bookings</h2>
            {bookingsLoading ? (
              <p>Loading your bookings...</p>
            ) : myBookings.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "40px", 
                background: "#fff", 
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}>
                <Calendar size={48} color="#9ca3af" style={{ marginBottom: "16px" }} />
                <p style={{ fontSize: "18px", color: "#6b7280", marginBottom: "8px" }}>
                  No bookings yet
                </p>
                <p style={{ color: "#9ca3af" }}>
                  Click on a tutor to book your first lesson!
                </p>
              </div>
            ) : (
              <div className="bookings-list">
                {myBookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <div>
                        <h3>{booking.tutor_name} {booking.tutor_surname}</h3>
                        <p className="booking-status" style={{ 
                          color: booking.status === 'confirmed' ? '#10b981' : 
                                booking.status === 'cancelled' ? '#ef4444' : 
                                booking.status === 'completed' ? '#6b7280' : '#10b981'
                        }}>
                          {booking.status === 'confirmed' ? 'Confirmed' :
                           booking.status === 'cancelled' ? 'Cancelled' :
                           booking.status === 'completed' ? 'Completed' : 'Confirmed'}
                        </p>
                      </div>
                      <div className="booking-price">
                        ${((booking.rate * booking.duration) / 60).toFixed(2)}
                      </div>
                    </div>
                    <div className="booking-details-list">
                      <div className="booking-detail-item">
                        <Calendar size={18} />
                        <span>{new Date(booking.lesson_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="booking-detail-item">
                        <Clock size={18} />
                        <span>{booking.lesson_time.substring(0, 5)} ({booking.duration} minutes)</span>
                      </div>
                      <div className="booking-detail-item">
                        <span>Rate: ${booking.rate}/hour</span>
                      </div>
                      {booking.notes && (
                        <div className="booking-notes">
                          <strong>Notes:</strong> {booking.notes}
                        </div>
                      )}
                    </div>
                    <div className="booking-actions-list">
                      <button 
                        className="google-cal-btn"
                        onClick={() => {
                          const calendarUrl = generateGoogleCalendarUrl(booking);
                          window.open(calendarUrl, "_blank");
                        }}
                      >
                        <Calendar size={16} /> Add to Google Calendar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Calendar view */}
        {!selectedTutor && view === "calendar" && (role === "student" || role === "tutor") && (
          <>
            <h2 className="section-title">My Calendar</h2>
            {role === "tutor" && tutors.length === 0 && loading ? (
              <p>Loading calendar...</p>
            ) : (
              <CalendarView 
                role={role} 
                userId={role === "student" ? studentId : null}
                tutorId={role === "tutor" ? getTutorId() : null}
              />
            )}
          </>
        )}

        {/* Courses Management view (Admin only) */}
        {!selectedTutor && view === "courses" && isAdmin && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 className="section-title">Manage Courses</h2>
              <button 
                className="add-button" 
                onClick={() => { 
                  setShowAddCourseForm(!showAddCourseForm); 
                  setIsEditingCourse(false);
                  setEditCourse(null);
                  setFormErrors({});
                }}
              >
                <Plus size={16} style={{ marginRight: 6 }} /> Add Course
              </button>
            </div>

            {/* Add Course Form */}
            {showAddCourseForm && !isEditingCourse && (
              <div style={{ 
                background: "var(--bg-primary)", 
                padding: "24px", 
                borderRadius: "16px", 
                boxShadow: "var(--shadow-lg)",
                marginBottom: "24px",
                border: "1px solid var(--border-light)"
              }}>
                <h3 style={{ marginTop: 0, marginBottom: "20px", color: "var(--text-primary)" }}>Add New Course</h3>
                <form onSubmit={handleAddCourse}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Course Name *" 
                        value={newCourse.name} 
                        onChange={(e) => {
                          setNewCourse({ ...newCourse, name: e.target.value });
                          if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                        }}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "10px",
                          border: formErrors.name ? "2px solid var(--error)" : "1px solid var(--border-light)",
                          fontSize: "16px",
                          fontFamily: "inherit"
                        }}
                        required 
                      />
                      {formErrors.name && <p style={{ color: "var(--error)", fontSize: "14px", margin: "6px 0 0 0" }}>{formErrors.name}</p>}
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Category (e.g., Math, Science, Language)" 
                        value={newCourse.category} 
                        onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "10px",
                          border: "1px solid var(--border-light)",
                          fontSize: "16px",
                          fontFamily: "inherit"
                        }}
                      />
                    </div>
                    <div>
                      <textarea 
                        placeholder="Course Description" 
                        value={newCourse.description} 
                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })} 
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "10px",
                          border: "1px solid var(--border-light)",
                          fontSize: "16px",
                          fontFamily: "inherit",
                          minHeight: "100px",
                          resize: "vertical"
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowAddCourseForm(false);
                          setFormErrors({});
                          setNewCourse({ name: "", description: "", category: "" });
                        }}
                        style={{
                          padding: "12px 24px",
                          borderRadius: "10px",
                          border: "1px solid var(--border-light)",
                          background: "var(--bg-primary)",
                          cursor: "pointer",
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "var(--text-secondary)"
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        style={{
                          padding: "12px 24px",
                          borderRadius: "10px",
                          border: "none",
                          background: "var(--gradient-primary)",
                          color: "var(--text-white)",
                          cursor: "pointer",
                          fontSize: "16px",
                          fontWeight: "600",
                          boxShadow: "var(--shadow-sm)"
                        }}
                      >
                        Add Course
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Edit Course Form */}
            {isEditingCourse && editCourse && (
              <div style={{ 
                background: "var(--bg-primary)", 
                padding: "24px", 
                borderRadius: "16px", 
                boxShadow: "var(--shadow-lg)",
                marginBottom: "24px",
                border: "1px solid var(--border-light)"
              }}>
                <h3 style={{ marginTop: 0, marginBottom: "20px", color: "var(--text-primary)" }}>Edit Course</h3>
                <form onSubmit={handleUpdateCourse}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Course Name *" 
                        value={editCourse.name} 
                        onChange={(e) => {
                          setEditCourse({ ...editCourse, name: e.target.value });
                          if (formErrors.name) setFormErrors({ ...formErrors, name: "" });
                        }}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "10px",
                          border: formErrors.name ? "2px solid var(--error)" : "1px solid var(--border-light)",
                          fontSize: "16px",
                          fontFamily: "inherit"
                        }}
                        required 
                      />
                      {formErrors.name && <p style={{ color: "var(--error)", fontSize: "14px", margin: "6px 0 0 0" }}>{formErrors.name}</p>}
                    </div>
                    <div>
                      <input 
                        type="text" 
                        placeholder="Category" 
                        value={editCourse.category || ""} 
                        onChange={(e) => setEditCourse({ ...editCourse, category: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "10px",
                          border: "1px solid var(--border-light)",
                          fontSize: "16px",
                          fontFamily: "inherit"
                        }}
                      />
                    </div>
                    <div>
                      <textarea 
                        placeholder="Course Description" 
                        value={editCourse.description || ""} 
                        onChange={(e) => setEditCourse({ ...editCourse, description: e.target.value })} 
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "10px",
                          border: "1px solid var(--border-light)",
                          fontSize: "16px",
                          fontFamily: "inherit",
                          minHeight: "100px",
                          resize: "vertical"
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                      <button 
                        type="button"
                        onClick={cancelEditCourse}
                        style={{
                          padding: "12px 24px",
                          borderRadius: "10px",
                          border: "1px solid var(--border-light)",
                          background: "var(--bg-primary)",
                          cursor: "pointer",
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "var(--text-secondary)"
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        style={{
                          padding: "12px 24px",
                          borderRadius: "10px",
                          border: "none",
                          background: "var(--gradient-primary)",
                          color: "var(--text-white)",
                          cursor: "pointer",
                          fontSize: "16px",
                          fontWeight: "600",
                          boxShadow: "var(--shadow-sm)"
                        }}
                      >
                        Update Course
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmCourseId && (
              <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000
              }}>
                <div style={{
                  background: "var(--bg-primary)",
                  padding: "32px",
                  borderRadius: "16px",
                  maxWidth: "400px",
                  width: "90%",
                  boxShadow: "var(--shadow-xl)"
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Confirm Delete</h3>
                  <p style={{ marginBottom: "24px", color: "var(--text-secondary)" }}>
                    Are you sure you want to delete this course? This action cannot be undone.
                  </p>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button
                      onClick={cancelDeleteCourse}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-light)",
                        background: "var(--bg-primary)",
                        cursor: "pointer",
                        fontSize: "16px"
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(deleteConfirmCourseId)}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        background: "var(--error)",
                        color: "var(--text-white)",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "600"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Courses List */}
            {coursesLoading ? (
              <p>Loading courses...</p>
            ) : courses.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "60px 20px", 
                background: "var(--bg-primary)", 
                borderRadius: "16px",
                boxShadow: "var(--shadow-sm)"
              }}>
                <GraduationCap size={48} color="var(--text-tertiary)" style={{ marginBottom: "16px" }} />
                <p style={{ fontSize: "18px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  No courses yet
                </p>
                <p style={{ color: "var(--text-tertiary)" }}>
                  Click "Add Course" to create your first course!
                </p>
              </div>
            ) : (
              <div className="tutor-list">
                {courses.map((course) => (
                  <div key={course.id} className="tutor-card">
                    <div className="tutor-details">
                      <h3>{course.name}</h3>
                      {course.category && (
                        <p className="tutor-subject" style={{ marginTop: "4px" }}>
                          {course.category}
                        </p>
                      )}
                      {course.description && (
                        <p className="tutor-bio" style={{ marginTop: "8px" }}>
                          {course.description}
                        </p>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        onClick={() => startEditCourse(course)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          border: "none",
                          background: "var(--primary)",
                          color: "var(--text-white)",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDeleteCourse(course.id)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          border: "none",
                          background: "var(--error)",
                          color: "var(--text-white)",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
