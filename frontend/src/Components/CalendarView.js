import React, { useState, useEffect } from 'react';
import './CalendarView.css';

function CalendarView({ role, userId, tutorId }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Load calendar events from localStorage
  useEffect(() => {
    const loadEvents = () => {
      const allEvents = JSON.parse(localStorage.getItem('calendarEvents') || '[]');
      
      // Filter events based on user role
      let userEvents = [];
      if (role === 'student') {
        userEvents = allEvents.filter(event => 
          event.type === 'booking' && event.booking?.student_id === userId
        );
      } else if (role === 'tutor') {
        userEvents = allEvents.filter(event => 
          event.type === 'booking' && event.tutor?.id === tutorId
        );
      }
      
      setEvents(userEvents);
    };

    loadEvents();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadEvents();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [role, userId, tutorId]);

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // Get events for a specific day
  const getEventsForDay = (day) => {
    if (!day) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === day.toDateString();
    });
  };

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Handle day click
  const handleDayClick = (day) => {
    setSelectedDate(day);
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      setSelectedEvent(dayEvents[0]);
      setShowEventModal(true);
    }
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Export to Google Calendar
  const exportToGoogleCalendar = (event) => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    const eventTitle = event.title;
    const eventDescription = `Tutoring Session\nDuration: ${Math.round((endDate - startDate) / 60000)} minutes\n${event.tutor ? `Tutor: ${event.tutor.name} ${event.tutor.surname}` : ''}\n${event.booking ? `Price: $${event.booking.price}` : ''}\n${event.booking?.notes || ''}`;
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, 'Z')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, 'Z')}&details=${encodeURIComponent(eventDescription)}`;
    window.open(googleCalendarUrl, "_blank");
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button onClick={previousMonth} className="calendar-nav-btn">
          ←
        </button>
        <h3>{monthYear}</h3>
        <button onClick={nextMonth} className="calendar-nav-btn">
          →
        </button>
      </div>

      <div className="calendar-grid">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isToday = day && day.toDateString() === new Date().toDateString();
          const hasBookings = dayEvents.length > 0;
          
          return (
            <div
              key={index}
              className={`calendar-day ${day ? 'calendar-day-active' : 'calendar-day-empty'} ${
                isToday ? 'calendar-day-today' : ''
              } ${hasBookings ? 'calendar-day-booking' : ''}`}
              onClick={() => day && handleDayClick(day)}
            >
              {day && (
                <>
                  <div className="calendar-day-number">
                    {day.getDate()}
                  </div>
                  {dayEvents.length > 0 && (
                    <>
                      <div className="calendar-events">
                        {dayEvents.slice(0, 3).map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className="calendar-event"
                            style={{ backgroundColor: event.color }}
                            title={event.title}
                          >
                            {event.title.length > 10 
                              ? `${event.title.substring(0, 10)}...` 
                              : event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="calendar-more-events">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                      {dayEvents.length > 1 && (
                        <div className="calendar-booking-count">
                          {dayEvents.length} sessions
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <div className="calendar-modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <h4>{selectedEvent.title}</h4>
              <button 
                className="calendar-modal-close"
                onClick={() => setShowEventModal(false)}
              >
                ×
              </button>
            </div>
            <div className="calendar-modal-body">
              <div className="calendar-modal-info">
                <div className="calendar-modal-row">
                  <strong>Date:</strong>
                  <span>{new Date(selectedEvent.start).toLocaleDateString()}</span>
                </div>
                <div className="calendar-modal-row">
                  <strong>Time:</strong>
                  <span>{formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}</span>
                </div>
                {selectedEvent.tutor && (
                  <div className="calendar-modal-row">
                    <strong>Tutor:</strong>
                    <span>{selectedEvent.tutor.name} {selectedEvent.tutor.surname}</span>
                  </div>
                )}
                {selectedEvent.booking && (
                  <>
                    <div className="calendar-modal-row">
                      <strong>Duration:</strong>
                      <span>{selectedEvent.booking.duration} minutes</span>
                    </div>
                    <div className="calendar-modal-row">
                      <strong>Status:</strong>
                      <span className={`calendar-status ${selectedEvent.booking.status}`}>
                        {selectedEvent.booking.status}
                      </span>
                    </div>
                    <div className="calendar-modal-row">
                      <strong>Price:</strong>
                      <span>${selectedEvent.booking.price}</span>
                    </div>
                    {selectedEvent.booking.notes && (
                      <div className="calendar-modal-row">
                        <strong>Notes:</strong>
                        <span>{selectedEvent.booking.notes}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="calendar-modal-footer">
              <button 
                className="calendar-modal-btn calendar-google-btn"
                onClick={() => exportToGoogleCalendar(selectedEvent)}
              >
                📅 Add to Google Calendar
              </button>
              <button 
                className="calendar-modal-btn"
                onClick={() => setShowEventModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="calendar-empty">
          <p>No scheduled sessions found.</p>
          <p>Book a tutoring session to see it here!</p>
        </div>
      )}
    </div>
  );
}

export default CalendarView;
