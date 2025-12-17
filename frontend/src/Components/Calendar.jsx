import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { getStudentBookings, getTutorBookings } from "../api/bookings";
import "./Calendar.css";

function CalendarView({ role, userId, tutorId }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ((role === "student" && userId) || (role === "tutor" && tutorId)) {
      loadBookings();
    }
  }, [role, userId, tutorId, currentDate]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      let data = [];
      if (role === "student" && userId) {
        data = await getStudentBookings(userId);
      } else if (role === "tutor" && tutorId) {
        data = await getTutorBookings(tutorId);
      }
      setBookings(data);
    } catch (err) {
      console.error("Error loading bookings for calendar:", err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getBookingsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.lesson_date).toISOString().split('T')[0];
      return bookingDate === dateStr;
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const isToday = (date) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  // Get bookings count for display
  const getBookingDisplayInfo = (dateBookings) => {
    if (dateBookings.length === 0) return null;
    const confirmed = dateBookings.filter(b => b.status === 'confirmed').length;
    return { total: dateBookings.length, confirmed };
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={goToPreviousMonth}>
          <ChevronLeft size={20} />
        </button>
        <div className="calendar-title">
          <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <button className="today-btn" onClick={goToToday}>Today</button>
        </div>
        <button className="calendar-nav-btn" onClick={goToNextMonth}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="calendar-grid">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          const dateBookings = getBookingsForDate(date);
          const isCurrentDay = isToday(date);
          const isPastDate = date && date < today && !isCurrentDay;
          const bookingInfo = getBookingDisplayInfo(dateBookings);

          return (
            <div
              key={index}
              className={`calendar-day ${!date ? 'empty' : ''} ${isCurrentDay ? 'today' : ''} ${isPastDate ? 'past' : ''}`}
            >
              {date && (
                <>
                  <div className="calendar-day-number">{date.getDate()}</div>
                  {dateBookings.length > 0 && (
                    <div className="calendar-bookings">
                      {dateBookings.map(booking => (
                        <div
                          key={booking.id}
                          className={`calendar-booking-dot ${booking.status}`}
                          title={`${booking.lesson_time ? booking.lesson_time.substring(0, 5) : ''} - ${role === 'student' ? (booking.tutor_name || 'Tutor') : (booking.student_id || 'Student')}`}
                        />
                      ))}
                    </div>
                  )}
                  {bookingInfo && (
                    <div className="calendar-booking-count">
                      {bookingInfo.total} {bookingInfo.total === 1 ? 'lesson' : 'lessons'}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot confirmed"></div>
          <span>Confirmed</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot cancelled"></div>
          <span>Cancelled</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot completed"></div>
          <span>Completed</span>
        </div>
      </div>

      {loading && (
        <div className="calendar-loading">
          Loading calendar...
        </div>
      )}
    </div>
  );
}

export default CalendarView;

