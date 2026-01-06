import React, { useState, useEffect } from "react";
import { Users, UserPlus, Calendar, DollarSign, BookOpen, FileText, Plus, Edit, Trash2, X, Clock, ChevronLeft, ChevronRight, GraduationCap, Database, Heart, Pencil } from "lucide-react";
import CalendarView from "../Components/CalendarView";
import "./Dashboard.css";
import { fetchTutors, createTutor, deleteTutor, updateTutor } from "../api/tutors";
import { getStudentBookings, generateGoogleCalendarUrl } from "../api/bookings";
import { fetchCourses, createCourse, updateCourse, deleteCourse, getCourseTutors } from "../api/courses";
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "../api/students";
import { fetchGrades, fetchGradesByStudent, createGrade, updateGrade, deleteGrade } from "../api/grades";
import { fetchAssignments, createAssignment, updateAssignment, deleteAssignment, submitAssignment } from "../api/assignments";
import BookingComponent from "../Components/Booking";




const placeholderImg = "https://via.placeholder.com/150";

function Dashboard({ isAdmin = false }) {
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
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [showAddAssignmentForm, setShowAddAssignmentForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: "", description: "", due_date: "", course_id: "", student_id: "", status: "pending" });
  const [isEditingAssignment, setIsEditingAssignment] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [deleteConfirmAssignmentId, setDeleteConfirmAssignmentId] = useState(null);
  const [submissionAssignmentId, setSubmissionAssignmentId] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [viewSubmissionAssignmentId, setViewSubmissionAssignmentId] = useState(null);
  const [viewSubmissionsAssignmentId, setViewSubmissionsAssignmentId] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  // Smart Scheduling State
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);
  const [selectedTutorForScheduling, setSelectedTutorForScheduling] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [schedulingLoading, setSchedulingLoading] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    subject: "",
    duration: 60,
    notes: "",
    payment_method: "card"
  });

  // Rating System State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [tutorToRate, setTutorToRate] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingLoading, setRatingLoading] = useState(false);
  const [tutorRatings, setTutorRatings] = useState({}); // Store ratings for each tutor

  // Tutor Features State
  const [showVideoConference, setShowVideoConference] = useState(false);
  const [videoSessionLink, setVideoSessionLink] = useState("");
  const [tutorEarnings, setTutorEarnings] = useState([]);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [tutorResources, setTutorResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [showAddResourceForm, setShowAddResourceForm] = useState(false);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    file_url: "",
    category: "document",
    is_public: false
  });
  const [editingResource, setEditingResource] = useState(null);
  const [videoSessions, setVideoSessions] = useState([]);
  const [showVideoSessions, setShowVideoSessions] = useState(false);

  // Backup System State
  const [backups, setBackups] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [backupSchedule, setBackupSchedule] = useState({
    enabled: false,
    frequency: 'weekly',
    time: '02:00',
    retention: 30 // days
  });

  

  // Sync dark mode with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('darkMode');
      if (saved) {
        setDarkMode(JSON.parse(saved));
      }
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  const role = localStorage.getItem("role");
  const studentId = localStorage.getItem("email") || localStorage.getItem("userId") || "student1";
  const tutorIdFromStorage = localStorage.getItem("tutorId");
  
  
  // Find tutor ID if user is a tutor
  const getTutorId = () => {
    if (role === "tutor") {
      // First try to get from localStorage
      if (tutorIdFromStorage) return tutorIdFromStorage;
      // If no tutors loaded yet, return null
      return null;
    }
    return null;
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
    // Dispatch storage event for other components
    window.dispatchEvent(new Event('storage'));
  };

  // Smart Scheduling Functions
  const openSchedulingModal = (tutor) => {
    setSelectedTutorForScheduling(tutor);
    setShowSchedulingModal(true);
    generateAvailableSlots(tutor);
  };

  const generateAvailableSlots = (tutor) => {
    // Generate mock available slots for the next 7 days
    const slots = [];
    const today = new Date();
    
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + day);
      
      // Generate slots from 9 AM to 8 PM
      for (let hour = 9; hour <= 20; hour++) {
        // Skip some random slots to simulate availability
        if (Math.random() > 0.3) {
          const slotDate = new Date(currentDate);
          slotDate.setHours(hour, 0, 0, 0);
          
          slots.push({
            id: `${day}-${hour}`,
            date: slotDate,
            dayName: slotDate.toLocaleDateString('en-US', { weekday: 'short' }),
            dateStr: slotDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            time: slotDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            available: true,
            price: tutor.rate || 50
          });
        }
      }
    }
    
    setAvailableSlots(slots.sort((a, b) => a.date - b.date));
  };

  const handleBookSession = async () => {
    if (!selectedSlot || !selectedTutorForScheduling) return;
    
    setSchedulingLoading(true);
    try {
      // Mock booking creation - in real app, this would call API
      const newBooking = {
        id: Date.now(),
        tutor_id: selectedTutorForScheduling.id,
        tutor_name: `${selectedTutorForScheduling.name} ${selectedTutorForScheduling.surname}`,
        student_id: studentId,
        subject: bookingForm.subject,
        date_time: selectedSlot.date.toISOString(),
        duration: bookingForm.duration,
        price: selectedSlot.price * (bookingForm.duration / 60),
        status: 'scheduled',
        payment_method: bookingForm.payment_method,
        payment_status: 'pending',
        notes: bookingForm.notes,
        created_at: new Date().toISOString()
      };
      
      setMyBookings([newBooking, ...myBookings]);
      
      // Add to calendar events
      const calendarEvent = {
        id: `booking-${newBooking.id}`,
        title: `${bookingForm.subject} with ${selectedTutorForScheduling.name}`,
        start: selectedSlot.date,
        end: new Date(selectedSlot.date.getTime() + bookingForm.duration * 60000),
        type: 'booking',
        tutor: selectedTutorForScheduling,
        booking: newBooking,
        color: '#059669'
      };
      
      // Get existing calendar events from localStorage
      const existingEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
      const updatedEvents = [...existingEvents, calendarEvent];
      localStorage.setItem('calendarEvents', JSON.stringify(updatedEvents));
      
      // Generate calendar links
      const startDate = selectedSlot.date;
      const endDate = new Date(selectedSlot.date.getTime() + bookingForm.duration * 60000);
      const eventTitle = `${bookingForm.subject} with ${selectedTutorForScheduling.name} ${selectedTutorForScheduling.surname}`;
      const eventDescription = `Tutoring Session\nDuration: ${bookingForm.duration} minutes\nPrice: $${selectedSlot.price * (bookingForm.duration / 60)}\nNotes: ${bookingForm.notes || 'N/A'}`;
      
      // Google Calendar URL
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, 'Z')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, 'Z')}&details=${encodeURIComponent(eventDescription)}`;
      
      // Save calendar URLs for later use
      newBooking.googleCalendarUrl = googleCalendarUrl;
      
      setMyBookings([newBooking, ...myBookings]);
      
      setSuccessMessage(
        <div>
          <div>Session scheduled successfully! Added to your calendar.</div>
          <div style={{ marginTop: '12px' }}>
            <a 
              href={googleCalendarUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                background: '#4285f4',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                marginRight: '8px'
              }}
            >
              📅 Add to Google Calendar
            </a>
            <button
              onClick={() => {
                // Create .ics file for Apple/Outlook Calendar
                const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Tutor4Kids//Booking//EN
BEGIN:VEVENT
UID:${newBooking.id}@tutor4kids.com
DTSTART:${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, 'Z')}
DTEND:${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, 'Z')}
SUMMARY:${eventTitle}
DESCRIPTION:${eventDescription.replace(/\n/g, '\\n')}
END:VEVENT
END:VCALENDAR`;
                
                const blob = new Blob([icsContent], { type: 'text/calendar' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `tutoring-session-${newBooking.id}.ics`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
              style={{
                padding: '8px 16px',
                background: '#000000',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              📱 Add to Apple/Outlook Calendar
            </button>
          </div>
        </div>
      );
      setShowSchedulingModal(false);
      setSelectedSlot(null);
      setBookingForm({ subject: "", duration: 60, notes: "", payment_method: "card" });
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError('Failed to schedule session. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setSchedulingLoading(false);
    }
  };

  // Rating System Functions
  const openRatingModal = (tutor) => {
    setTutorToRate(tutor);
    setShowRatingModal(true);
    setRating(0);
    setRatingComment("");
  };

  const handleRatingSubmit = async () => {
    if (rating === 0 || !tutorToRate) return;
    
    setRatingLoading(true);
    try {
      // Mock rating submission - in real app, this would call API
      const newRating = {
        tutor_id: tutorToRate.id,
        student_id: studentId,
        rating: rating,
        comment: ratingComment,
        created_at: new Date().toISOString()
      };
      
      // Update tutor ratings
      const currentRatings = tutorRatings[tutorToRate.id] || [];
      const updatedRatings = [...currentRatings, newRating];
      setTutorRatings({
        ...tutorRatings,
        [tutorToRate.id]: updatedRatings
      });
      
      setSuccessMessage('Thank you for your rating!');
      setShowRatingModal(false);
      setRating(0);
      setRatingComment("");
      
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError('Failed to submit rating. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setRatingLoading(false);
    }
  };

  const getAverageRating = (tutorId) => {
    const ratings = tutorRatings[tutorId] || [];
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const renderStars = (rating, interactive = false, onRate = null) => {
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onRate && onRate(star)}
            disabled={!interactive}
            style={{
              background: 'none',
              border: 'none',
              cursor: interactive ? 'pointer' : 'default',
              fontSize: '20px',
              color: star <= rating ? '#fbbf24' : '#d1d5db',
              transition: 'all 0.2s ease'
            }}
          >
            {star <= rating ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    );
  };

  // Tutor Features Functions
  const startVideoConference = (booking) => {
    // Generate a mock video conference link
    const sessionId = `session-${booking.id}-${Date.now()}`;
    const link = `https://meet.jit.si/Tutor4Kids-${sessionId}`;
    setVideoSessionLink(link);
    setShowVideoConference(true);
    
    // Add to video sessions
    const newVideoSession = {
      id: Date.now(),
      booking_id: booking.id,
      session_link: link,
      start_time: new Date().toISOString(),
      status: 'active',
      student_name: booking.student_name || 'Student',
      subject: booking.subject || 'Tutoring Session'
    };
    setVideoSessions([newVideoSession, ...videoSessions]);
  };

  const loadTutorEarnings = async () => {
    setEarningsLoading(true);
    try {
      // Mock earnings data - in real app, this would call API
      const mockEarnings = [
        { id: 1, date: '2024-01-15', amount: 50, session_type: 'individual', student_name: 'John Doe', duration: 60 },
        { id: 2, date: '2024-01-16', amount: 75, session_type: 'group', student_name: 'Multiple', duration: 90 },
        { id: 3, date: '2024-01-17', amount: 50, session_type: 'individual', student_name: 'Jane Smith', duration: 60 },
        { id: 4, date: '2024-01-18', amount: 100, session_type: 'individual', student_name: 'Mike Johnson', duration: 120 },
        { id: 5, date: '2024-01-19', amount: 50, session_type: 'individual', student_name: 'Sarah Wilson', duration: 60 }
      ];
      setTutorEarnings(mockEarnings);
    } catch (err) {
      setError('Failed to load earnings data');
      setTimeout(() => setError(null), 5000);
    } finally {
      setEarningsLoading(false);
    }
  };

  const loadTutorResources = async () => {
    setResourcesLoading(true);
    try {
      // Mock resources data - in real app, this would call API
      const mockResources = [
        { id: 1, title: 'Mathematics Basics', description: 'Introduction to basic math concepts', file_url: '/resources/math-basics.pdf', category: 'document', is_public: true, created_at: '2024-01-15' },
        { id: 2, title: 'English Grammar Guide', description: 'Comprehensive grammar rules and examples', file_url: '/resources/english-grammar.pdf', category: 'document', is_public: false, created_at: '2024-01-16' },
        { id: 3, title: 'Science Experiments', description: 'Fun science experiments for students', file_url: '/resources/science-experiments.pdf', category: 'video', is_public: true, created_at: '2024-01-17' },
        { id: 4, title: 'History Timeline', description: 'Important historical events timeline', file_url: '/resources/history-timeline.pdf', category: 'document', is_public: true, created_at: '2024-01-18' }
      ];
      setTutorResources(mockResources);
    } catch (err) {
      setError('Failed to load resources');
      setTimeout(() => setError(null), 5000);
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleAddResource = async () => {
    try {
      // Mock resource creation - in real app, this would call API
      const resource = {
        id: Date.now(),
        ...newResource,
        created_at: new Date().toISOString()
      };
      setTutorResources([resource, ...tutorResources]);
      setNewResource({ title: "", description: "", file_url: "", category: "document", is_public: false });
      setShowAddResourceForm(false);
      setSuccessMessage('Resource added successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError('Failed to add resource');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteResource = (resourceId) => {
    setTutorResources(tutorResources.filter(r => r.id !== resourceId));
    setSuccessMessage('Resource deleted successfully!');
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const getTotalEarnings = () => {
    return tutorEarnings.reduce((total, earning) => total + earning.amount, 0);
  };

  const getMonthlyEarnings = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return tutorEarnings
      .filter(earning => {
        const earningDate = new Date(earning.date);
        return earningDate.getMonth() === currentMonth && earningDate.getFullYear() === currentYear;
      })
      .reduce((total, earning) => total + earning.amount, 0);
  };

  // Backup System Functions
  const loadBackups = async () => {
    try {
      // Mock backup data - in real app, this would call API
      const mockBackups = [
        { id: 1, name: 'daily_backup_2024-01-20', date: '2024-01-20T02:00:00Z', size: '15.2 MB', type: 'automatic', status: 'completed' },
        { id: 2, name: 'manual_backup_2024-01-19', date: '2024-01-19T14:30:00Z', size: '15.1 MB', type: 'manual', status: 'completed' },
        { id: 3, name: 'daily_backup_2024-01-19', date: '2024-01-19T02:00:00Z', size: '15.1 MB', type: 'automatic', status: 'completed' },
        { id: 4, name: 'daily_backup_2024-01-18', date: '2024-01-18T02:00:00Z', size: '15.0 MB', type: 'automatic', status: 'completed' },
        { id: 5, name: 'weekly_backup_2024-01-14', date: '2024-01-14T02:00:00Z', size: '15.3 MB', type: 'scheduled', status: 'completed' }
      ];
      setBackups(mockBackups);
    } catch (err) {
      setError('Failed to load backups');
      setTimeout(() => setError(null), 5000);
    }
  };

  const createBackup = async (type = 'manual') => {
    setBackupLoading(true);
    setBackupProgress(0);
    
    try {
      // Simulate backup process
      for (let i = 0; i <= 100; i += 10) {
        setBackupProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const newBackup = {
        id: Date.now(),
        name: `${type}_backup_${new Date().toISOString().split('T')[0]}`,
        date: new Date().toISOString(),
        size: '15.2 MB',
        type: type,
        status: 'completed'
      };
      
      setBackups([newBackup, ...backups]);
      setSuccessMessage('Backup created successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
      setShowBackupModal(false);
    } catch (err) {
      setError('Failed to create backup');
      setTimeout(() => setError(null), 5000);
    } finally {
      setBackupLoading(false);
      setBackupProgress(0);
    }
  };

  const restoreBackup = async (backup) => {
    setBackupLoading(true);
    setRestoreProgress(0);
    
    try {
      // Simulate restore process
      for (let i = 0; i <= 100; i += 10) {
        setRestoreProgress(i);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setSuccessMessage(`Successfully restored from ${backup.name}`);
      setTimeout(() => setSuccessMessage(null), 5000);
      setShowRestoreModal(false);
      setSelectedBackup(null);
    } catch (err) {
      setError('Failed to restore backup');
      setTimeout(() => setError(null), 5000);
    } finally {
      setBackupLoading(false);
      setRestoreProgress(0);
    }
  };

  const deleteBackup = async (backupId) => {
    try {
      setBackups(backups.filter(b => b.id !== backupId));
      setSuccessMessage('Backup deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError('Failed to delete backup');
      setTimeout(() => setError(null), 5000);
    }
  };

  const downloadBackup = async (backup) => {
    try {
      // Simulate download
      const link = document.createElement('a');
      link.href = '#'; // In real app, this would be actual backup file URL
      link.download = `${backup.name}.zip`;
      link.click();
      setSuccessMessage('Backup download started!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError('Failed to download backup');
      setTimeout(() => setError(null), 5000);
    }
  };

  const updateBackupSchedule = async () => {
    try {
      // Mock schedule update - in real app, this would call API
      setSuccessMessage('Backup schedule updated successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setError('Failed to update backup schedule');
      setTimeout(() => setError(null), 5000);
    }
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

  // Load tutor earnings when earnings view is opened
  useEffect(() => {
    if (role === "tutor" && view === "earnings") {
      loadTutorEarnings();
    }
  }, [view, role]);

  // Load tutor resources when resources view is opened
  useEffect(() => {
    if (role === "tutor" && view === "resources") {
      loadTutorResources();
    }
  }, [view, role]);

  // Load backups when backup view is opened (admin only)
  useEffect(() => {
    if (isAdmin && view === "backup") {
      loadBackups();
    }
  }, [view, isAdmin]);

  // Load courses when Courses view is opened (admin or student)
  useEffect(() => {
    if (view === "courses") {
      loadCourses();
    }
  }, [view]);

  useEffect(() => {
    if (view === "assignments") {
      loadAssignments();
    }
  }, [view]);

  

  // Load students for admin
  useEffect(() => {
    if (isAdmin && view === "students") {
      loadStudents();
    }
  }, [view, isAdmin]);

  // Load grades for current role
  useEffect(() => {
    if (view === "grades") {
      loadGrades();
    }
  }, [view]);

 
  useEffect(() => {
    if (view === "assignments") {
      loadAssignments();
      if (isAdmin || role === "tutor") {
        if (students.length === 0) loadStudents();
        if (courses.length === 0) loadCourses();
      }
    }
  }, [view, isAdmin, role]);

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
      let data;
      if (role === "student") {
        data = await fetchGradesByStudent(studentId);
      } else {
        data = await fetchGrades();
      }
      setGrades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading grades:", err);
      setError(err.message || "Failed to load grades");
      setTimeout(() => setError(null), 5000);
    } finally {
      setGradesLoading(false);
    }
  };


  const loadAssignments = async () => {
    setAssignmentsLoading(true);
    try {
      const data = await fetchAssignments(role === "student" ? studentId : "");
      setAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading assignments:", err);
      setError(err.message || "Failed to load assignments");
      setTimeout(() => setError(null), 5000);
    } finally {
      setAssignmentsLoading(false);
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

  // Assignments CRUD
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (!newAssignment.title.trim()) {
      setFormErrors({ title: "Title is required" });
      return;
    }
    try {
      const payload = {
        title: newAssignment.title.trim(),
        description: newAssignment.description || "",
        due_date: newAssignment.due_date || null,
        course_id: newAssignment.course_id || null,
        student_id: newAssignment.student_id || null,
        status: newAssignment.status || "pending",
      };
      const created = await createAssignment(payload);
      setAssignments([created, ...assignments]);
      setShowAddAssignmentForm(false);
      setNewAssignment({ title: "", description: "", due_date: "", course_id: "", student_id: "", status: "pending" });
      setFormErrors({});
      setSuccessMessage(`Assignment "${created.title}" added successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to add assignment");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleMarkAsSubmitted = async () => {
    if (!submissionAssignmentId) return;
    try {
      await submitAssignment(submissionAssignmentId, submissionFiles);
      setSuccessMessage("Assignment submitted successfully!");
      loadAssignments();
      setSubmissionAssignmentId(null);
      setSubmissionFiles([]);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to submit assignment:", err);
      setError("Failed to submit assignment.");
    }
  };

  const startEditAssignment = (assignment) => {
    setEditAssignment({ ...assignment, course_id: assignment.course_id || "", student_id: assignment.student_id || "", due_date: assignment.due_date ? assignment.due_date.slice(0, 10) : "" });
    setIsEditingAssignment(true);
    setShowAddAssignmentForm(false);
    setFormErrors({});
  };

  const cancelEditAssignment = () => {
    setIsEditingAssignment(false);
    setEditAssignment(null);
    setFormErrors({});
  };

  const handleUpdateAssignment = async (e) => {
    e.preventDefault();
    if (!editAssignment || !editAssignment.title.trim()) {
      setFormErrors({ title: "Title is required" });
      return;
    }
    try {
      const payload = {
        title: editAssignment.title.trim(),
        description: editAssignment.description || "",
        due_date: editAssignment.due_date || null,
        course_id: editAssignment.course_id || null,
        student_id: editAssignment.student_id || null,
        status: editAssignment.status || "pending",
      };
      const updated = await updateAssignment(editAssignment.id, payload);
      setAssignments(assignments.map((a) => (a.id === editAssignment.id ? updated : a)));
      setIsEditingAssignment(false);
      setEditAssignment(null);
      setFormErrors({});
      setSuccessMessage(`Assignment "${updated.title}" updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to update assignment");
      setTimeout(() => setError(null), 5000);
    }
  };

  const confirmDeleteAssignment = (id) => setDeleteConfirmAssignmentId(id);
  const cancelDeleteAssignment = () => setDeleteConfirmAssignmentId(null);
  const handleDeleteAssignment = async (id) => {
    try {
      await deleteAssignment(id);
      setAssignments(assignments.filter((a) => a.id !== id));
      setDeleteConfirmAssignmentId(null);
      setSuccessMessage("Assignment deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete assignment");
      setTimeout(() => setError(null), 5000);
    }
  };

  const likedTutors = tutors.filter((tutor) => favorites.includes(tutor.id));

  return (
    <div className="dashboard-container menu-dashboard-container">
      <aside className="sidebar" style={{
        background: darkMode ? "#1f2937" : "#ffffff",
        borderRight: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
        color: darkMode ? "#f9fafb" : "#111827",
        transition: "all 0.3s ease"
      }}>
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

        

          {role === "student" && (
            <li onClick={() => setView("bookings")}>
              <BookOpen size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              My Bookings
            </li>
          )}
          {role === "student" && (
            <li onClick={() => setView("tutors")}>
              <GraduationCap size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Find Tutors
            </li>
          )}
          {(role === "admin" || role === "tutor" || role === "student") && (
            <li onClick={() => setView("assignments")}>
              <BookOpen size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Assignments
            </li>
          )}
          {isAdmin && (
            <li onClick={() => setView("courses")}>
              <GraduationCap size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Courses
            </li>
          )}
          {(role === "student" || role === "tutor") && (
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
              <Users size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Students
            </li>
          )}
          {isAdmin && (
            <li onClick={() => setView("grades")}>
              <GraduationCap size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Grades
            </li>
          )}
          {isAdmin && (
            <li onClick={() => setView("backup")}>
              <Database size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Backup System
            </li>
          )}
          {role === "tutor" && (
            <li onClick={() => setView("earnings")}>
              <DollarSign size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Earnings
            </li>
          )}
          {role === "tutor" && (
            <li onClick={() => setView("resources")}>
              <FileText size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Resources
            </li>
          )}
          {role === "tutor" && (
            <li onClick={() => setShowVideoSessions(true)}>
              <Calendar size={16} style={{ marginRight: 8, verticalAlign: "middle" }} />
              Video Sessions
            </li>
          )}
        </ul>
      </aside>

      <main className="main-content" style={{
        background: darkMode ? "#111827" : "#ffffff",
        color: darkMode ? "#f9fafb" : "#111827",
        minHeight: "100vh",
        transition: "all 0.3s ease"
      }}>
        {loading && <p>Loading tutors...</p>}
        {error && (
          <div style={{ 
            background: darkMode ? "#7f1d1d" : "#fee2e2", 
            color: darkMode ? "#fca5a5" : "#b91c1c", 
            padding: "12px 16px", 
            borderRadius: "8px", 
            marginBottom: "16px",
            border: darkMode ? "1px solid #991b1b" : "1px solid #fecaca",
            transition: "all 0.3s ease"
          }}>
            {error}
          </div>
        )}
        {successMessage && (
          <div style={{ 
            background: darkMode ? "#064e3b" : "#d1fae5", 
            color: darkMode ? "#6ee7b7" : "#065f46", 
            padding: "12px 16px", 
            borderRadius: "8px", 
            marginBottom: "16px",
            border: darkMode ? "1px solid #065f46" : "1px solid #a7f3d0",
            transition: "all 0.3s ease"
          }}>
            {successMessage}
          </div>
        )}

        {/* Welcome Dashboard */}
        {!selectedTutor && view === "dashboard" && (
          <div style={{ 
            background: darkMode 
              ? "linear-gradient(135deg, #4c1d95 0%, #5b21b6 100%)" 
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
            padding: "32px", 
            borderRadius: "16px", 
            marginBottom: "24px",
            color: "white",
            boxShadow: darkMode 
              ? "0 10px 25px rgba(0,0,0,0.3)" 
              : "0 10px 25px rgba(0,0,0,0.1)",
            transition: "all 0.3s ease"
          }}>
            <h1 style={{ margin: "0 0 16px 0", fontSize: "28px", fontWeight: "700" }}>
              {role === "admin" && "Welcome, Administrator! 🎓"}
              {role === "tutor" && "Welcome, Tutor! 📚"}
              {role === "student" && "Welcome, Student! 🎯"}
            </h1>
            <p style={{ margin: "0 0 20px 0", fontSize: "16px", lineHeight: "1.5", opacity: 0.95 }}>
              {role === "admin" && "Manage your tutoring platform with ease. Monitor students, tutors, courses, and track academic progress all in one place."}
              {role === "tutor" && "Empower students through personalized learning. Manage your schedule, create assignments, and track student progress effectively."}
              {role === "student" && "Achieve your academic goals with personalized tutoring. Find tutors, submit assignments, and track your learning journey."}
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {role === "admin" && (
                <>
                  <div style={{ 
                    background: "rgba(255,255,255,0.2)", 
                    padding: "12px 16px", 
                    borderRadius: "8px",
                    fontSize: "14px",
                    backdropFilter: "blur(10px)"
                  }}>
                    <strong>{students.length}</strong> Students
                  </div>
                  <div style={{ 
                    background: "rgba(255,255,255,0.2)", 
                    padding: "12px 16px", 
                    borderRadius: "8px",
                    fontSize: "14px",
                    backdropFilter: "blur(10px)"
                  }}>
                    <strong>{tutors.length}</strong> Tutors
                  </div>
                  <div style={{ 
                    background: "rgba(255,255,255,0.2)", 
                    padding: "12px 16px", 
                    borderRadius: "8px",
                    fontSize: "14px",
                    backdropFilter: "blur(10px)"
                  }}>
                    <strong>{courses.length}</strong> Courses
                  </div>
                </>
              )}
              {role === "tutor" && (
                <>
                  <div style={{ 
                    background: "rgba(255,255,255,0.2)", 
                    padding: "12px 16px", 
                    borderRadius: "8px",
                    fontSize: "14px",
                    backdropFilter: "blur(10px)"
                  }}>
                    <strong>📅</strong> Calendar
                  </div>
                  <div style={{ 
                    background: "rgba(255,255,255,0.2)", 
                    padding: "12px 16px", 
                    borderRadius: "8px",
                    fontSize: "14px",
                    backdropFilter: "blur(10px)"
                  }}>
                    <strong>📝</strong> Assignments
                  </div>
                  <div style={{ 
                    background: "rgba(255,255,255,0.2)", 
                    padding: "12px 16px", 
                    borderRadius: "8px",
                    fontSize: "14px",
                    backdropFilter: "blur(10px)"
                  }}>
                    <strong>📊</strong> Grades
                  </div>
                </>
              )}
              {role === "student" && (
                <>
                  <div style={{ 
                    background: "rgba(255,255,255,0.2)", 
                    padding: "12px 16px", 
                    borderRadius: "8px",
                    fontSize: "14px",
                    backdropFilter: "blur(10px)"
                  }}>
                    <strong>👨‍🏫</strong> Find Tutors
                  </div>
                  <div style={{ 
                    background: "rgba(255,255,255,0.2)", 
                    padding: "12px 16px", 
                    borderRadius: "8px",
                    fontSize: "14px",
                    backdropFilter: "blur(10px)"
                  }}>
                    <strong>📚</strong> Assignments
                  </div>
                  <div style={{ 
                    background: "rgba(255,255,255,0.2)", 
                    padding: "12px 16px", 
                    borderRadius: "8px",
                    fontSize: "14px",
                    backdropFilter: "blur(10px)"
                  }}>
                    <strong>📈</strong> Grades
                  </div>
                </>
              )}
            </div>
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

        {/* Grades view (Student/Tutor read-only) */}
        {!selectedTutor && view === "grades" && !isAdmin && (
          <>
            <h2 className="section-title">{role === "student" ? "My Grades" : "Grades"}</h2>
            {gradesLoading ? (
              <p>Loading grades...</p>
            ) : grades.length === 0 ? (
              <p>No grades yet.</p>
            ) : (
              <div className="bookings-list">
                {grades.map((g) => (
                  <div key={g.id} className="booking-card">
                    <div className="booking-header">
                      <div>
                        <h3>
                          {role === "tutor"
                            ? (g.student_first_name ? `${g.student_first_name} ${g.student_last_name}` : `Student #${g.student_id}`)
                            : (g.course_name ? g.course_name : "No course")}
                        </h3>
                        <p className="booking-status">Grade: {g.grade_value}</p>
                      </div>
                    </div>
                    {g.comments && (
                      <div className="booking-notes"><strong>Comments:</strong> {g.comments}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Assignments view (all roles can see; admin/tutor can CRUD) */}
        {!selectedTutor && view === "assignments" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 className="section-title">Assignments</h2>
              {(role === "admin" || role === "tutor") && (
                <button
                  className="add-button"
                  onClick={() => {
                    setShowAddAssignmentForm(!showAddAssignmentForm);
                    setIsEditingAssignment(false);
                    setEditAssignment(null);
                    setFormErrors({});
                  }}
                >
                  <Plus size={16} style={{ marginRight: 6 }} /> Add Assignment
                </button>
              )}
            </div>

            {showAddAssignmentForm && (role === "admin" || role === "tutor") && (
              <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>New Assignment</h3>
                <form onSubmit={handleAddAssignment}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <input type="text" placeholder="Title *" value={newAssignment.title} onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} style={{ flex: 1, minWidth: 220, padding: 10 }} />
                    <select value={newAssignment.status} onChange={(e) => setNewAssignment({ ...newAssignment, status: e.target.value })} style={{ flex: 1, minWidth: 160, padding: 10 }}>
                      <option value="pending">pending</option>
                      <option value="submitted">submitted</option>
                      <option value="graded">graded</option>
                    </select>
                    <input type="datetime-local" placeholder="Due date" value={newAssignment.due_date} onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })} style={{ flex: 1, minWidth: 220, padding: 10 }} />
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
                    <select value={newAssignment.student_id} onChange={(e) => setNewAssignment({ ...newAssignment, student_id: e.target.value })} style={{ flex: 1, minWidth: 180, padding: 10 }} required>
                      <option value="">Select Student *</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.email})</option>)}
                    </select>
                  </div>
                  <textarea placeholder="Description" value={newAssignment.description} onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} style={{ width: "100%", marginTop: 10, padding: 10, minHeight: 100 }} />
                  {Object.values(formErrors || {}).length > 0 && (
                    <p style={{ color: "#e11d48", marginTop: 8 }}>{Object.values(formErrors).join(" • ")}</p>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                    <button type="button" onClick={() => { setShowAddAssignmentForm(false); setNewAssignment({ title: "", description: "", status: "pending", course_id: "", student_id: "", tutor_id: "", due_date: "" }); setFormErrors({}); }}>Cancel</button>
                    <button type="submit" className="add-button">Create</button>
                  </div>
                </form>
              </div>
            )}

            {isEditingAssignment && editAssignment && (role === "admin" || role === "tutor") && (
              <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
                <h3 style={{ marginTop: 0, marginBottom: 16 }}>Edit Assignment</h3>
                <form onSubmit={handleUpdateAssignment}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <input type="text" placeholder="Title *" value={editAssignment.title} onChange={(e) => setEditAssignment({ ...editAssignment, title: e.target.value })} style={{ flex: 1, minWidth: 220, padding: 10 }} />
                    <select value={editAssignment.status} onChange={(e) => setEditAssignment({ ...editAssignment, status: e.target.value })} style={{ flex: 1, minWidth: 160, padding: 10 }}>
                      <option value="pending">pending</option>
                      <option value="submitted">submitted</option>
                      <option value="graded">graded</option>
                    </select>
                    <input type="datetime-local" placeholder="Due date" value={editAssignment.due_date || ""} onChange={(e) => setEditAssignment({ ...editAssignment, due_date: e.target.value })} style={{ flex: 1, minWidth: 220, padding: 10 }} />
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
                    <select value={editAssignment.student_id || ""} onChange={(e) => setEditAssignment({ ...editAssignment, student_id: e.target.value })} style={{ flex: 1, minWidth: 180, padding: 10 }} required>
                      <option value="">Select Student *</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.email})</option>)}
                    </select>
                  </div>
                  <textarea placeholder="Description" value={editAssignment.description || ""} onChange={(e) => setEditAssignment({ ...editAssignment, description: e.target.value })} style={{ width: "100%", marginTop: 10, padding: 10, minHeight: 100 }} />
                  {Object.values(formErrors || {}).length > 0 && (
                    <p style={{ color: "#e11d48", marginTop: 8 }}>{Object.values(formErrors).join(" • ")}</p>
                  )}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                    <button type="button" onClick={cancelEditAssignment}>Cancel</button>
                    <button type="submit" className="add-button">Save</button>
                  </div>
                </form>
              </div>
            )}

            {assignmentsLoading ? (
              <p>Loading assignments...</p>
            ) : assignments.length === 0 ? (
              <p>No assignments yet.</p>
            ) : (
              <div className="bookings-list">
                {assignments.map((a) => (
                  <div key={a.id} className="booking-card">
                    <div className="booking-header">
                      <div>
                        <h3>{a.title}</h3>
                        <p className="booking-status">{a.status}</p>
                        {a.file_path && (
                          <a href={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/${a.file_path}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, display: "block", marginTop: 4, color: "#0284c7" }}>
                            View Submission
                          </a>
                        )}
                      </div>
                      {a.due_date && (
                        <div className="booking-price">
                          Due: {new Date(a.due_date).toLocaleString()}
                        </div>
                      )}
                    </div>
                    {a.description && (
                      <div className="booking-notes"><strong>Details:</strong> {a.description}</div>
                    )}
                    <div className="booking-details-list">
                      {a.course_id && <div className="booking-detail-item">Course ID: {a.course_id}</div>}
                      {a.student_id && <div className="booking-detail-item">Student ID: {a.student_id}</div>}
                      {a.tutor_id && <div className="booking-detail-item">Tutor ID: {a.tutor_id}</div>}
                    </div>
                    {(role === "admin" || role === "tutor") && (
                      <div className="booking-actions-list">
                        <button className="view-profile-btn" onClick={() => startEditAssignment(a)}><Pencil size={14} /> Edit</button>
                        <button className="view-profile-btn" onClick={() => setViewSubmissionsAssignmentId(a.id)}>View Submissions</button>
                        <button className="remove-button" onClick={() => setDeleteConfirmAssignmentId(a.id)}><Trash2 size={14} /> Delete</button>
                      </div>
                    )}
                    {role === "student" && a.status !== "submitted" && a.status !== "graded" && (
                      <div className="booking-actions-list">
                        <button className="view-profile-btn" onClick={() => setSubmissionAssignmentId(a.id)}>Upload Work Files/Photos</button>
                      </div>
                    )}
                    {role === "student" && a.status === "submitted" && (
                      <div className="booking-actions-list">
                        <button className="view-profile-btn" onClick={() => setViewSubmissionAssignmentId(a.id)}>View Submission</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {deleteConfirmAssignmentId && (role === "admin" || role === "tutor") && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                <div style={{ background: "#fff", padding: 24, borderRadius: 12, maxWidth: 400, width: "90%" }}>
                  <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
                  <p>Delete this assignment?</p>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                    <button onClick={() => setDeleteConfirmAssignmentId(null)}>Cancel</button>
                    <button onClick={() => handleDeleteAssignment(deleteConfirmAssignmentId)} style={{ background: "#b91c1c", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 6 }}>Delete</button>
                  </div>
                </div>
              </div>
            )}

            {/* Assignment Submission Modal */}
            {submissionAssignmentId && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                <div style={{ 
                  background: darkMode ? "#1f2937" : "#fff", 
                  padding: 24, 
                  borderRadius: 12, 
                  maxWidth: 600, 
                  width: "90%",
                  color: darkMode ? "#f9fafb" : "#111827",
                  transition: "all 0.3s ease"
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 16 }}>Submit Assignment</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleMarkAsSubmitted();
                  }}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", marginBottom: 8, fontWeight: "600" }}>Upload Files (Multiple files allowed):</label>
                      <input 
                        type="file" 
                        multiple
                        onChange={(e) => setSubmissionFiles(Array.from(e.target.files))}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                        style={{ 
                          width: "100%", 
                          padding: "12px", 
                          borderRadius: "8px", 
                          border: darkMode ? "1px solid #374151" : "1px solid #ddd",
                          fontSize: "16px",
                          background: darkMode ? "#111827" : "#ffffff",
                          color: darkMode ? "#f9fafb" : "#111827",
                          transition: "all 0.3s ease"
                        }}
                      />
                      {submissionFiles.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <p style={{ marginBottom: 8, fontWeight: "600", color: "#065f46" }}>
                            Selected Files ({submissionFiles.length}):
                          </p>
                          {submissionFiles.map((file, index) => (
                            <div key={index} style={{
                              padding: "8px 12px",
                              backgroundColor: "#f0f9ff",
                              border: "1px solid #0284c7",
                              borderRadius: "6px",
                              marginBottom: "6px",
                              fontSize: "14px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}>
                              <span>📄 {file.name}</span>
                              <span style={{ fontSize: "12px", color: "#666" }}>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                      <button 
                        type="button"
                        onClick={() => {
                          setSubmissionAssignmentId(null);
                          setSubmissionFiles([]);
                        }}
                        style={{
                          padding: "12px 24px",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          background: "#fff",
                          cursor: "pointer",
                          fontSize: "16px"
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={submissionFiles.length === 0}
                        style={{
                          padding: "12px 24px",
                          borderRadius: "8px",
                          border: "none",
                          background: submissionFiles.length > 0 ? "#0284c7" : "#ccc",
                          color: "#fff",
                          cursor: submissionFiles.length > 0 ? "pointer" : "not-allowed",
                          fontSize: "16px",
                          fontWeight: "600"
                        }}
                      >
                        Submit Assignment{submissionFiles.length > 1 ? ` (${submissionFiles.length} files)` : ''}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* View Submission Modal */}
            {viewSubmissionAssignmentId && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                <div style={{ background: "#fff", padding: 24, borderRadius: 12, maxWidth: 600, width: "90%" }}>
                  <h3 style={{ marginTop: 0, marginBottom: 16 }}>Assignment Submission</h3>
                  {(() => {
                    const assignment = assignments.find(a => a.id === viewSubmissionAssignmentId);
                    if (!assignment) return <p>Assignment not found.</p>;
                    
                    return (
                      <div>
                        <div style={{ marginBottom: 16 }}>
                          <h4 style={{ marginBottom: 8 }}>{assignment.title}</h4>
                          <p style={{ color: "#666", marginBottom: 8 }}>{assignment.description}</p>
                          <p style={{ fontSize: "14px", color: "#888" }}>
                            Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                          </p>
                          <p style={{ fontSize: "14px", color: "#065f46", fontWeight: "600" }}>
                            Status: Submitted
                          </p>
                        </div>
                        
                        <div style={{ marginBottom: 16 }}>
                          <h5 style={{ marginBottom: 12 }}>Submitted Files:</h5>
                          {assignment.file_path ? (
                            <div style={{ 
                              padding: "12px", 
                              border: "1px solid #ddd", 
                              borderRadius: "8px",
                              backgroundColor: "#f9f9f9"
                            }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <div style={{ 
                                    width: "40px", 
                                    height: "40px", 
                                    backgroundColor: "#e3f2fd", 
                                    borderRadius: "8px", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center",
                                    marginRight: "12px"
                                  }}>
                                    📄
                                  </div>
                                  <div>
                                    <p style={{ margin: 0, fontWeight: "600" }}>
                                      {assignment.file_path.split('/').pop()}
                                    </p>
                                    <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                                      Submitted file
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => window.open(`http://localhost:5000/${assignment.file_path}`, '_blank')}
                                  style={{
                                    padding: "8px 16px",
                                    borderRadius: "6px",
                                    border: "1px solid #0284c7",
                                    background: "#fff",
                                    color: "#0284c7",
                                    cursor: "pointer",
                                    fontSize: "14px"
                                  }}
                                >
                                  View File
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p style={{ color: "#666", fontStyle: "italic" }}>No file uploaded</p>
                          )}
                        </div>

                        {assignment.files && assignment.files.length > 0 && (
                          <div style={{ marginBottom: 16 }}>
                            <h5 style={{ marginBottom: 12 }}>Additional Files:</h5>
                            {assignment.files.map((file, index) => (
                              <div key={file.id} style={{ 
                                padding: "8px", 
                                border: "1px solid #ddd", 
                                borderRadius: "6px",
                                marginBottom: "8px",
                                backgroundColor: "#f9f9f9"
                              }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <span style={{ fontSize: "14px" }}>
                                    📎 {file.file_path.split('/').pop()}
                                  </span>
                                  <button
                                    onClick={() => window.open(`http://localhost:5000/${file.file_path}`, '_blank')}
                                    style={{
                                      padding: "4px 8px",
                                      borderRadius: "4px",
                                      border: "1px solid #0284c7",
                                      background: "#fff",
                                      color: "#0284c7",
                                      cursor: "pointer",
                                      fontSize: "12px"
                                    }}
                                  >
                                    View
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                    <button 
                      onClick={() => setViewSubmissionAssignmentId(null)}
                      style={{
                        padding: "12px 24px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: "16px"
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Teacher View Submissions Modal */}
            {viewSubmissionsAssignmentId && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
                <div style={{ background: "#fff", padding: 24, borderRadius: 12, maxWidth: 800, width: "90%", maxHeight: "80vh", overflowY: "auto" }}>
                  <h3 style={{ marginTop: 0, marginBottom: 16 }}>Assignment Submissions</h3>
                  {(() => {
                    const assignment = assignments.find(a => a.id === viewSubmissionsAssignmentId);
                    if (!assignment) return <p>Assignment not found.</p>;
                    
                    return (
                      <div>
                        <div style={{ marginBottom: 20, padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                          <h4 style={{ marginBottom: 8 }}>{assignment.title}</h4>
                          <p style={{ color: "#666", marginBottom: 8 }}>{assignment.description}</p>
                          <p style={{ fontSize: "14px", color: "#888" }}>
                            Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}
                          </p>
                          <p style={{ fontSize: "14px", color: "#666" }}>
                            Student: {assignment.student_first_name ? `${assignment.student_first_name} ${assignment.student_last_name}` : `Student ID: ${assignment.student_id}`}
                          </p>
                          <p style={{ fontSize: "14px", fontWeight: "600", color: assignment.status === "submitted" ? "#065f46" : "#d97706" }}>
                            Status: {assignment.status}
                          </p>
                        </div>
                        
                        <div style={{ marginBottom: 16 }}>
                          <h5 style={{ marginBottom: 12 }}>Submitted Files:</h5>
                          {assignment.files && assignment.files.length > 0 ? (
                            <div>
                              {assignment.files.map((file, index) => (
                                <div key={file.id} style={{ 
                                  padding: "12px", 
                                  border: "1px solid #ddd", 
                                  borderRadius: "8px",
                                  marginBottom: "8px",
                                  backgroundColor: "#f9f9f9"
                                }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                      <div style={{ 
                                        width: "40px", 
                                        height: "40px", 
                                        backgroundColor: "#e3f2fd", 
                                        borderRadius: "8px", 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center",
                                        marginRight: "12px"
                                      }}>
                                        📄
                                      </div>
                                      <div>
                                        <p style={{ margin: 0, fontWeight: "600" }}>
                                          {file.file_path.split('/').pop()}
                                        </p>
                                        <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                                          Uploaded: {file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString() : 'Unknown date'}
                                        </p>
                                      </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                      <button
                                        onClick={() => window.open(`http://localhost:5000/${file.file_path}`, '_blank')}
                                        style={{
                                          padding: "8px 16px",
                                          borderRadius: "6px",
                                          border: "1px solid #0284c7",
                                          background: "#fff",
                                          color: "#0284c7",
                                          cursor: "pointer",
                                          fontSize: "14px"
                                        }}
                                      >
                                        View File
                                      </button>
                                      <button
                                        onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = `http://localhost:5000/${file.file_path}`;
                                          link.download = file.file_path.split('/').pop();
                                          link.click();
                                        }}
                                        style={{
                                          padding: "8px 16px",
                                          borderRadius: "6px",
                                          border: "1px solid #059669",
                                          background: "#fff",
                                          color: "#059669",
                                          cursor: "pointer",
                                          fontSize: "14px"
                                        }}
                                      >
                                        Download
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div style={{ 
                              padding: "20px", 
                              textAlign: "center", 
                              backgroundColor: "#f8f9fa", 
                              borderRadius: "8px",
                              border: "1px solid #e9ecef"
                            }}>
                              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📁</div>
                              <p style={{ color: "#666", margin: 0 }}>
                                {assignment.status === "submitted" ? "No files uploaded" : "Assignment not submitted yet"}
                              </p>
                            </div>
                          )}
                        </div>

                        {assignment.file_path && (
                          <div style={{ marginBottom: 16 }}>
                            <h5 style={{ marginBottom: 12 }}>Main Submission File:</h5>
                            <div style={{ 
                              padding: "12px", 
                              border: "1px solid #ddd", 
                              borderRadius: "8px",
                              backgroundColor: "#f9f9f9"
                            }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <div style={{ 
                                    width: "40px", 
                                    height: "40px", 
                                    backgroundColor: "#e3f2fd", 
                                    borderRadius: "8px", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    justifyContent: "center",
                                    marginRight: "12px"
                                  }}>
                                    📄
                                  </div>
                                  <div>
                                    <p style={{ margin: 0, fontWeight: "600" }}>
                                      {assignment.file_path.split('/').pop()}
                                    </p>
                                    <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                                      Main submission file
                                    </p>
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button
                                    onClick={() => window.open(`http://localhost:5000/${assignment.file_path}`, '_blank')}
                                    style={{
                                      padding: "8px 16px",
                                      borderRadius: "6px",
                                      border: "1px solid #0284c7",
                                      background: "#fff",
                                      color: "#0284c7",
                                      cursor: "pointer",
                                      fontSize: "14px"
                                    }}
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = `http://localhost:5000/${assignment.file_path}`;
                                      link.download = assignment.file_path.split('/').pop();
                                      link.click();
                                    }}
                                    style={{
                                      padding: "8px 16px",
                                      borderRadius: "6px",
                                      border: "1px solid #059669",
                                      background: "#fff",
                                      color: "#059669",
                                      cursor: "pointer",
                                      fontSize: "14px"
                                    }}
                                  >
                                    Download
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                    <button 
                      onClick={() => setViewSubmissionsAssignmentId(null)}
                      style={{
                        padding: "12px 24px",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: "16px"
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Smart Scheduling Modal */}
            {showSchedulingModal && selectedTutorForScheduling && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "16px" }}>
                <div style={{ 
                  background: darkMode ? "#1f2937" : "#fff", 
                  padding: 24, 
                  borderRadius: 12, 
                  maxWidth: 800, 
                  width: "100%", 
                  maxHeight: "90vh", 
                  overflowY: "auto",
                  color: darkMode ? "#f9fafb" : "#111827",
                  transition: "all 0.3s ease"
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: "20px" }}>Schedule Session with {selectedTutorForScheduling.name} {selectedTutorForScheduling.surname}</h3>
                  
                  {/* Booking Form */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
                      <div>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: "600", fontSize: "14px" }}>Subject:</label>
                        <input 
                          type="text" 
                          value={bookingForm.subject}
                          onChange={(e) => setBookingForm({...bookingForm, subject: e.target.value})}
                          placeholder="e.g., Mathematics, English"
                          style={{ 
                            width: "100%", 
                            padding: "12px", 
                            borderRadius: "8px", 
                            border: darkMode ? "1px solid #374151" : "1px solid #ddd",
                            fontSize: "16px",
                            background: darkMode ? "#111827" : "#ffffff",
                            color: darkMode ? "#f9fafb" : "#111827",
                            boxSizing: "border-box"
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: 8, fontWeight: "600", fontSize: "14px" }}>Duration:</label>
                        <select 
                          value={bookingForm.duration}
                          onChange={(e) => setBookingForm({...bookingForm, duration: parseInt(e.target.value)})}
                          style={{ 
                            width: "100%", 
                            padding: "12px", 
                            borderRadius: "8px", 
                            border: darkMode ? "1px solid #374151" : "1px solid #ddd",
                            fontSize: "16px",
                            background: darkMode ? "#111827" : "#ffffff",
                            color: darkMode ? "#f9fafb" : "#111827",
                            boxSizing: "border-box"
                          }}
                        >
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={90}>1.5 hours</option>
                          <option value={120}>2 hours</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", marginBottom: 8, fontWeight: "600", fontSize: "14px" }}>Notes (optional):</label>
                      <textarea 
                        value={bookingForm.notes}
                        onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                        placeholder="Any specific topics or requirements..."
                        style={{ 
                          width: "100%", 
                          padding: "12px", 
                          borderRadius: "8px", 
                          border: darkMode ? "1px solid #374151" : "1px solid #ddd",
                          fontSize: "16px",
                          background: darkMode ? "#111827" : "#ffffff",
                          color: darkMode ? "#f9fafb" : "#111827",
                          minHeight: "80px",
                          resize: "vertical",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                  </div>

                  {/* Available Time Slots */}
                  <div style={{ marginBottom: 20 }}>
                    <h4 style={{ marginBottom: 12, fontSize: "16px" }}>Available Time Slots:</h4>
                    <div style={{ 
                      maxHeight: "300px", 
                      overflowY: "auto", 
                      border: darkMode ? "1px solid #374151" : "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "12px"
                    }}>
                      {availableSlots.length === 0 ? (
                        <p style={{ textAlign: "center", color: darkMode ? "#9ca3af" : "#6b7280" }}>Loading available slots...</p>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                          {availableSlots.map((slot) => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              disabled={!slot.available}
                              style={{
                                padding: "12px 8px",
                                borderRadius: "8px",
                                border: selectedSlot?.id === slot.id ? "2px solid #059669" : darkMode ? "1px solid #374151" : "1px solid #ddd",
                                background: selectedSlot?.id === slot.id ? "#059669" : (slot.available ? (darkMode ? "#374151" : "#f9fafb") : "#e5e7eb"),
                                color: selectedSlot?.id === slot.id ? "#fff" : (slot.available ? (darkMode ? "#f9fafb" : "#111827") : "#9ca3af"),
                                cursor: slot.available ? "pointer" : "not-allowed",
                                opacity: slot.available ? 1 : 0.5,
                                fontSize: "13px",
                                transition: "all 0.2s ease",
                                minHeight: "100px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center"
                              }}
                            >
                              <div style={{ fontWeight: "600", fontSize: "14px" }}>{slot.dayName}</div>
                              <div style={{ fontSize: "12px" }}>{slot.dateStr}</div>
                              <div style={{ fontSize: "13px", fontWeight: "500" }}>{slot.time}</div>
                              <div style={{ fontSize: "11px", marginTop: "4px" }}>${slot.price}/hr</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: "600", fontSize: "14px" }}>Payment Method:</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "14px" }}>
                        <input 
                          type="radio" 
                          value="card"
                          checked={bookingForm.payment_method === "card"}
                          onChange={(e) => setBookingForm({...bookingForm, payment_method: e.target.value})}
                        />
                        <span>Credit/Debit Card</span>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "14px" }}>
                        <input 
                          type="radio" 
                          value="paypal"
                          checked={bookingForm.payment_method === "paypal"}
                          onChange={(e) => setBookingForm({...bookingForm, payment_method: e.target.value})}
                        />
                        <span>PayPal</span>
                      </label>
                    </div>
                  </div>

                  {/* Price Summary */}
                  {selectedSlot && (
                    <div style={{ 
                      padding: "16px", 
                      backgroundColor: darkMode ? "#374151" : "#f3f4f6", 
                      borderRadius: "8px", 
                      marginBottom: 20 
                    }}>
                      <h4 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>Price Summary:</h4>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "14px" }}>
                        <span>Session Duration:</span>
                        <span>{bookingForm.duration} minutes</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: "14px" }}>
                        <span>Rate:</span>
                        <span>${selectedSlot.price}/hr</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "18px", paddingTop: 8, borderTop: darkMode ? "1px solid #4b5563" : "1px solid #d1d5db" }}>
                        <span>Total:</span>
                        <span>${(selectedSlot.price * (bookingForm.duration / 60)).toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button 
                      onClick={() => {
                        setShowSchedulingModal(false);
                        setSelectedTutorForScheduling(null);
                        setSelectedSlot(null);
                        setBookingForm({ subject: "", duration: 60, notes: "", payment_method: "card" });
                      }}
                      style={{
                        padding: "14px 24px",
                        borderRadius: "8px",
                        border: darkMode ? "1px solid #4b5563" : "1px solid #ddd",
                        background: darkMode ? "#374151" : "#fff",
                        color: darkMode ? "#f9fafb" : "#111827",
                        cursor: "pointer",
                        fontSize: "16px",
                        width: "100%",
                        boxSizing: "border-box"
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleBookSession}
                      disabled={!selectedSlot || !bookingForm.subject || schedulingLoading}
                      style={{
                        padding: "14px 24px",
                        borderRadius: "8px",
                        border: "none",
                        background: schedulingLoading ? "#9ca3af" : "#059669",
                        color: "#fff",
                        cursor: schedulingLoading ? "not-allowed" : "pointer",
                        fontSize: "16px",
                        fontWeight: "600",
                        width: "100%",
                        boxSizing: "border-box"
                      }}
                    >
                      {schedulingLoading ? "Scheduling..." : "Book & Pay"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Rating Modal */}
            {showRatingModal && tutorToRate && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "16px" }}>
                <div style={{ 
                  background: darkMode ? "#1f2937" : "#fff", 
                  padding: 24, 
                  borderRadius: 12, 
                  maxWidth: 500, 
                  width: "100%",
                  maxHeight: "90vh",
                  overflowY: "auto",
                  color: darkMode ? "#f9fafb" : "#111827",
                  transition: "all 0.3s ease"
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: "20px" }}>Rate {tutorToRate.name} {tutorToRate.surname}</h3>
                  
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 12, fontWeight: "600", fontSize: "14px" }}>Your Rating:</label>
                    {renderStars(rating, true, setRating)}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: "600", fontSize: "14px" }}>Comment (optional):</label>
                    <textarea 
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Share your experience with this tutor..."
                      style={{ 
                        width: "100%", 
                        padding: "12px", 
                        borderRadius: "8px", 
                        border: darkMode ? "1px solid #374151" : "1px solid #ddd",
                        fontSize: "16px",
                        background: darkMode ? "#111827" : "#ffffff",
                        color: darkMode ? "#f9fafb" : "#111827",
                        minHeight: "100px",
                        resize: "vertical",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button 
                      onClick={() => {
                        setShowRatingModal(false);
                        setTutorToRate(null);
                        setRating(0);
                        setRatingComment("");
                      }}
                      style={{
                        padding: "14px 24px",
                        borderRadius: "8px",
                        border: darkMode ? "1px solid #4b5563" : "1px solid #ddd",
                        background: darkMode ? "#374151" : "#fff",
                        color: darkMode ? "#f9fafb" : "#111827",
                        cursor: "pointer",
                        fontSize: "16px",
                        width: "100%",
                        boxSizing: "border-box"
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleRatingSubmit}
                      disabled={rating === 0 || ratingLoading}
                      style={{
                        padding: "14px 24px",
                        borderRadius: "8px",
                        border: "none",
                        background: ratingLoading ? "#9ca3af" : "#f59e0b",
                        color: "#fff",
                        cursor: ratingLoading ? "not-allowed" : "pointer",
                        fontSize: "16px",
                        fontWeight: "600",
                        width: "100%",
                        boxSizing: "border-box"
                      }}
                    >
                      {ratingLoading ? "Submitting..." : "Submit Rating"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Sessions Modal */}
            {showVideoSessions && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "16px" }}>
                <div style={{ 
                  background: darkMode ? "#1f2937" : "#fff", 
                  padding: 24, 
                  borderRadius: 12, 
                  maxWidth: 800, 
                  width: "100%", 
                  maxHeight: "80vh", 
                  overflowY: "auto",
                  color: darkMode ? "#f9fafb" : "#111827",
                  transition: "all 0.3s ease"
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 16 }}>Video Sessions</h3>
                  
                  {videoSessions.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "40px" }}>
                      <Calendar size={48} style={{ color: darkMode ? "#9ca3af" : "#6b7280", marginBottom: "16px" }} />
                      <p style={{ fontSize: "18px", color: darkMode ? "#9ca3af" : "#6b7280", marginBottom: "8px" }}>
                        No video sessions yet
                      </p>
                      <p style={{ color: darkMode ? "#6b7280" : "#9ca3af" }}>
                        Start a video conference from your bookings
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: "16px" }}>
                      {videoSessions.map((session) => (
                        <div key={session.id} style={{
                          background: darkMode ? "#374151" : "#f9fafb",
                          padding: "16px",
                          borderRadius: "8px",
                          border: darkMode ? "1px solid #4b5563" : "1px solid #e5e7eb"
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <div>
                              <h4 style={{ margin: 0, fontSize: "16px", color: darkMode ? "#f9fafb" : "#111827" }}>
                                {session.subject}
                              </h4>
                              <p style={{ margin: 0, fontSize: "14px", color: darkMode ? "#9ca3af" : "#6b7280" }}>
                                with {session.student_name}
                              </p>
                            </div>
                            <span style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: "600",
                              background: session.status === "active" ? "#059669" : "#6b7280",
                              color: "white"
                            }}>
                              {session.status}
                            </span>
                          </div>
                          <div style={{ marginBottom: "12px" }}>
                            <p style={{ margin: 0, fontSize: "12px", color: darkMode ? "#9ca3af" : "#6b7280" }}>
                              Started: {new Date(session.start_time).toLocaleString()}
                            </p>
                          </div>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => window.open(session.session_link, '_blank')}
                              style={{
                                background: "#3b82f6",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "8px 16px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "600"
                              }}
                            >
                              🎥 Join Session
                            </button>
                            <button
                              onClick={() => navigator.clipboard.writeText(session.session_link)}
                              style={{
                                background: "#6b7280",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                padding: "8px 16px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "600"
                              }}
                            >
                              📋 Copy Link
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                    <button 
                      onClick={() => setShowVideoSessions(false)}
                      style={{
                        padding: "12px 24px",
                        borderRadius: "8px",
                        border: darkMode ? "1px solid #4b5563" : "1px solid #ddd",
                        background: darkMode ? "#374151" : "#fff",
                        color: darkMode ? "#f9fafb" : "#111827",
                        cursor: "pointer",
                        fontSize: "16px"
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Video Conference Modal */}
            {showVideoConference && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "16px" }}>
                <div style={{ 
                  background: darkMode ? "#1f2937" : "#fff", 
                  padding: 24, 
                  borderRadius: 12, 
                  maxWidth: 600, 
                  width: "100%",
                  color: darkMode ? "#f9fafb" : "#111827",
                  transition: "all 0.3s ease"
                }}>
                  <h3 style={{ marginTop: 0, marginBottom: 16 }}>Video Conference Started!</h3>
                  
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ marginBottom: 12, fontSize: "16px" }}>
                      Your video conference is ready. Click the button below to join the session:
                    </p>
                    <div style={{ background: darkMode ? "#374151" : "#f3f4f6", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                      <p style={{ margin: 0, fontSize: "14px", wordBreak: "break-all", color: darkMode ? "#f9fafb" : "#111827" }}>
                        <span style={{ fontWeight: "600" }}>Session Link:</span> {videoSessionLink}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <button
                      onClick={() => window.open(videoSessionLink, '_blank')}
                      style={{
                        background: "#3b82f6",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "14px 24px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "600",
                        width: "100%"
                      }}
                    >
                      🎥 Join Video Conference
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(videoSessionLink)}
                      style={{
                        background: "#6b7280",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "14px 24px",
                        cursor: "pointer",
                        fontSize: "16px",
                        fontWeight: "600",
                        width: "100%"
                      }}
                    >
                      📋 Copy Link
                    </button>
                    <button
                      onClick={() => {
                        setShowVideoConference(false);
                        setVideoSessionLink("");
                      }}
                      style={{
                        background: "#6b7280",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "14px 24px",
                        cursor: "pointer",
                        fontSize: "16px",
                        width: "100%"
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
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

        {/* Tutors view (Student only) */}
        {!selectedTutor && view === "tutors" && role === "student" && (
          <>
            <h2 className="section-title">Find Tutors</h2>
            {loading ? (
              <p>Loading tutors...</p>
            ) : tutors.length === 0 ? (
              <p>No tutors available yet.</p>
            ) : (
              <div className="tutor-list">
                {tutors.map((t) => (
                  <div 
                    key={t.id} 
                    className={`tutor-card ${highlightedId === t.id ? 'highlighted' : ''}`}
                    onClick={() => setSelectedTutor(t)}
                  >
                    <div className="tutor-details">
                      <h3>{t.name} {t.surname}</h3>
                      <p className="tutor-subject" style={{ marginTop: 4 }}>Rate: ${Number(t.rate).toFixed(2)}/hr</p>
                      {t.bio && <p className="tutor-bio" style={{ marginTop: 8 }}>{t.bio}</p>}
                      
                      {/* Rating Display */}
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {renderStars(getAverageRating(t.id))}
                        <span style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                          {getAverageRating(t.id) > 0 ? `(${tutorRatings[t.id]?.length || 0} reviews)` : '(No reviews yet)'}
                        </span>
                      </div>
                    </div>
                    <div style={{ position: "absolute", top: 8, right: 8, display: "flex", flexDirection: "column", gap: "6px" }}>
                      <Heart
                        size={20}
                        color={favorites.includes(t.id) ? "#e63946" : "#bbb"}
                        fill={favorites.includes(t.id) ? "#e63946" : "none"}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(t.id);
                        }}
                        style={{ cursor: "pointer" }}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); openSchedulingModal(t); }}
                        style={{
                          background: "#059669",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                          minWidth: "60px"
                        }}
                      >
                        📅 Schedule
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openRatingModal(t); }}
                        style={{
                          background: "#f59e0b",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                          minWidth: "60px"
                        }}
                      >
                        ⭐ Rate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                          // Generate Google Calendar URL
                          const startDate = new Date(`${booking.lesson_date}T${booking.lesson_time}`);
                          const endDate = new Date(startDate.getTime() + booking.duration * 60000);
                          const eventTitle = `${booking.subject || 'Tutoring Session'} with ${booking.tutor_name}`;
                          const eventDescription = `Tutoring Session\nDuration: ${booking.duration} minutes\nRate: $${booking.rate}/hour\nNotes: ${booking.notes || 'N/A'}`;
                          
                          const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, 'Z')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, 'Z')}&details=${encodeURIComponent(eventDescription)}`;
                          window.open(googleCalendarUrl, "_blank");
                        }}
                      >
                        📅 Add to Google Calendar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Earnings view (Tutor only) */}
        {!selectedTutor && view === "earnings" && role === "tutor" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 className="section-title">My Earnings</h2>
              <button
                onClick={loadTutorEarnings}
                style={{
                  background: "#059669",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                🔄 Refresh
              </button>
            </div>

            {earningsLoading ? (
              <p>Loading earnings data...</p>
            ) : (
              <div style={{ display: "grid", gap: "20px" }}>
                {/* Earnings Summary Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                  <div style={{
                    background: darkMode ? "#1f2937" : "#fff",
                    padding: "20px",
                    borderRadius: "12px",
                    border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <DollarSign size={24} style={{ marginRight: "8px", color: "#059669" }} />
                      <h3 style={{ margin: 0, fontSize: "14px", color: darkMode ? "#9ca3af" : "#6b7280" }}>Total Earnings</h3>
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: darkMode ? "#f9fafb" : "#111827" }}>
                      ${getTotalEarnings().toFixed(2)}
                    </div>
                  </div>

                  <div style={{
                    background: darkMode ? "#1f2937" : "#fff",
                    padding: "20px",
                    borderRadius: "12px",
                    border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <Calendar size={24} style={{ marginRight: "8px", color: "#3b82f6" }} />
                      <h3 style={{ margin: 0, fontSize: "14px", color: darkMode ? "#9ca3af" : "#6b7280" }}>This Month</h3>
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: darkMode ? "#f9fafb" : "#111827" }}>
                      ${getMonthlyEarnings().toFixed(2)}
                    </div>
                  </div>

                  <div style={{
                    background: darkMode ? "#1f2937" : "#fff",
                    padding: "20px",
                    borderRadius: "12px",
                    border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
                      <Users size={24} style={{ marginRight: "8px", color: "#f59e0b" }} />
                      <h3 style={{ margin: 0, fontSize: "14px", color: darkMode ? "#9ca3af" : "#6b7280" }}>Total Sessions</h3>
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: "700", color: darkMode ? "#f9fafb" : "#111827" }}>
                      {tutorEarnings.length}
                    </div>
                  </div>
                </div>

                {/* Earnings Table */}
                <div style={{
                  background: darkMode ? "#1f2937" : "#fff",
                  borderRadius: "12px",
                  border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                  overflow: "hidden"
                }}>
                  <div style={{ padding: "20px", borderBottom: darkMode ? "1px solid #374151" : "1px solid #e5e7eb" }}>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>Recent Earnings</h3>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: darkMode ? "#374151" : "#f9fafb" }}>
                          <th style={{ padding: "12px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: darkMode ? "#f9fafb" : "#111827" }}>Date</th>
                          <th style={{ padding: "12px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: darkMode ? "#f9fafb" : "#111827" }}>Student</th>
                          <th style={{ padding: "12px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: darkMode ? "#f9fafb" : "#111827" }}>Type</th>
                          <th style={{ padding: "12px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: darkMode ? "#f9fafb" : "#111827" }}>Duration</th>
                          <th style={{ padding: "12px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: darkMode ? "#f9fafb" : "#111827" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tutorEarnings.map((earning) => (
                          <tr key={earning.id} style={{ borderBottom: darkMode ? "1px solid #374151" : "1px solid #e5e7eb" }}>
                            <td style={{ padding: "12px", fontSize: "14px", color: darkMode ? "#f9fafb" : "#111827" }}>
                              {new Date(earning.date).toLocaleDateString()}
                            </td>
                            <td style={{ padding: "12px", fontSize: "14px", color: darkMode ? "#f9fafb" : "#111827" }}>
                              {earning.student_name}
                            </td>
                            <td style={{ padding: "12px", fontSize: "14px" }}>
                              <span style={{
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "600",
                                background: earning.session_type === "individual" ? "#059669" : "#f59e0b",
                                color: "white"
                              }}>
                                {earning.session_type}
                              </span>
                            </td>
                            <td style={{ padding: "12px", fontSize: "14px", color: darkMode ? "#f9fafb" : "#111827" }}>
                              {earning.duration} min
                            </td>
                            <td style={{ padding: "12px", fontSize: "14px", fontWeight: "600", textAlign: "right", color: "#059669" }}>
                              ${earning.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Resources view (Tutor only) */}
        {!selectedTutor && view === "resources" && role === "tutor" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 className="section-title">My Resources</h2>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setShowAddResourceForm(!showAddResourceForm)}
                  style={{
                    background: "#059669",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}
                >
                  ➕ Add Resource
                </button>
                <button
                  onClick={loadTutorResources}
                  style={{
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600"
                  }}
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Add Resource Form */}
            {showAddResourceForm && (
              <div style={{
                background: darkMode ? "#1f2937" : "#fff",
                padding: "24px",
                borderRadius: "12px",
                marginBottom: "20px",
                border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ marginTop: 0, marginBottom: "20px", color: darkMode ? "#f9fafb" : "#111827" }}>
                  Add New Resource
                </h3>
                <div style={{ display: "grid", gap: "16px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: darkMode ? "#f9fafb" : "#111827" }}>Title:</label>
                    <input
                      type="text"
                      value={newResource.title}
                      onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                      placeholder="Resource title"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: darkMode ? "1px solid #374151" : "1px solid #ddd",
                        fontSize: "16px",
                        background: darkMode ? "#111827" : "#ffffff",
                        color: darkMode ? "#f9fafb" : "#111827"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: darkMode ? "#f9fafb" : "#111827" }}>Description:</label>
                    <textarea
                      value={newResource.description}
                      onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                      placeholder="Resource description"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: darkMode ? "1px solid #374151" : "1px solid #ddd",
                        fontSize: "16px",
                        background: darkMode ? "#111827" : "#ffffff",
                        color: darkMode ? "#f9fafb" : "#111827",
                        minHeight: "80px",
                        resize: "vertical"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: darkMode ? "#f9fafb" : "#111827" }}>File URL:</label>
                    <input
                      type="text"
                      value={newResource.file_url}
                      onChange={(e) => setNewResource({...newResource, file_url: e.target.value})}
                      placeholder="File URL or path"
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: darkMode ? "1px solid #374151" : "1px solid #ddd",
                        fontSize: "16px",
                        background: darkMode ? "#111827" : "#ffffff",
                        color: darkMode ? "#f9fafb" : "#111827"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: darkMode ? "#f9fafb" : "#111827" }}>Category:</label>
                    <select
                      value={newResource.category}
                      onChange={(e) => setNewResource({...newResource, category: e.target.value})}
                      style={{
                        width: "100%",
                        padding: "12px",
                        borderRadius: "8px",
                        border: darkMode ? "1px solid #374151" : "1px solid #ddd",
                        fontSize: "16px",
                        background: darkMode ? "#111827" : "#ffffff",
                        color: darkMode ? "#f9fafb" : "#111827"
                      }}
                    >
                      <option value="document">Document</option>
                      <option value="video">Video</option>
                      <option value="image">Image</option>
                      <option value="audio">Audio</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={newResource.is_public}
                        onChange={(e) => setNewResource({...newResource, is_public: e.target.checked})}
                        style={{ cursor: "pointer" }}
                      />
                      <span style={{ color: darkMode ? "#f9fafb" : "#111827" }}>Make public (visible to all students)</span>
                    </label>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button
                    onClick={handleAddResource}
                    style={{
                      background: "#059669",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 24px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600"
                    }}
                  >
                    Add Resource
                  </button>
                  <button
                    onClick={() => {
                      setShowAddResourceForm(false);
                      setNewResource({ title: "", description: "", file_url: "", category: "document", is_public: false });
                    }}
                    style={{
                      background: "#6b7280",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 24px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {resourcesLoading ? (
              <p>Loading resources...</p>
            ) : tutorResources.length === 0 ? (
              <div style={{
                textAlign: "center",
                padding: "40px",
                background: darkMode ? "#1f2937" : "#fff",
                borderRadius: "12px",
                border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb"
              }}>
                <FileText size={48} style={{ color: darkMode ? "#9ca3af" : "#6b7280", marginBottom: "16px" }} />
                <p style={{ fontSize: "18px", color: darkMode ? "#9ca3af" : "#6b7280", marginBottom: "8px" }}>
                  No resources yet
                </p>
                <p style={{ color: darkMode ? "#6b7280" : "#9ca3af" }}>
                  Add your first teaching resource to get started!
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {tutorResources.map((resource) => (
                  <div key={resource.id} style={{
                    background: darkMode ? "#1f2937" : "#fff",
                    border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "20px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <h3 style={{ margin: 0, fontSize: "16px", color: darkMode ? "#f9fafb" : "#111827" }}>{resource.title}</h3>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <span style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background: resource.category === "document" ? "#3b82f6" : 
                                       resource.category === "video" ? "#ef4444" : 
                                       resource.category === "image" ? "#10b981" : "#6b7280",
                          color: "white"
                        }}>
                          {resource.category}
                        </span>
                        {resource.is_public && (
                          <span style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background: "#059669",
                            color: "white"
                          }}>
                            Public
                          </span>
                        )}
                      </div>
                    </div>
                    <p style={{ color: darkMode ? "#9ca3af" : "#6b7280", marginBottom: "16px", fontSize: "14px" }}>
                      {resource.description}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "12px", color: darkMode ? "#6b7280" : "#9ca3af" }}>
                        Added: {new Date(resource.created_at).toLocaleDateString()}
                      </span>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => window.open(resource.file_url, '_blank')}
                          style={{
                            background: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteResource(resource.id)}
                          style={{
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "600"
                          }}
                        >
                          Delete
                        </button>
                      </div>
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

export default Dashboard;
