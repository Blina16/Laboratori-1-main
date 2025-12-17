import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, X } from "lucide-react";
import { createBooking, checkAvailability, generateGoogleCalendarUrl } from "../api/bookings";
import "./Booking.css";

function BookingComponent({ tutor, onClose, studentId }) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [booking, setBooking] = useState(null);

  // Generate time slots (9 AM to 8 PM, hourly)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Check availability when date is selected
  useEffect(() => {
    if (selectedDate && tutor?.id) {
      setLoading(true);
      setError(null);
      
      console.log('Checking availability for tutor:', tutor.id, 'on date:', selectedDate); // Debug log
      
      checkAvailability(tutor.id, selectedDate)
        .then((data) => {
          console.log('Availability data received:', data); // Debug log
          // Filter out booked times
          const bookedTimes = data.bookings.map(b => {
            const time = b.lesson_time;
            // Handle both HH:MM:SS and HH:MM formats
            return time.substring(0, 5);
          });
          const available = timeSlots.filter(time => !bookedTimes.includes(time));
          setAvailableSlots(available);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Availability check failed:", err);
          setError(err.message || "Failed to check availability. Please try again.");
          setAvailableSlots([]);
          setLoading(false);
        });
    } else {
      setAvailableSlots([]);
      setError(null);
    }
  }, [selectedDate, tutor?.id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError("Please select both date and time");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        studentId: studentId || localStorage.getItem("email") || "student1",
        tutorId: tutor.id,
        lessonDate: selectedDate,
        lessonTime: selectedTime,
        duration: duration,
        notes: notes
      };

      const newBooking = await createBooking(bookingData);
      setBooking(newBooking);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToGoogleCalendar = () => {
    if (booking) {
      const calendarUrl = generateGoogleCalendarUrl(booking);
      window.open(calendarUrl, "_blank");
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="booking-modal-header">
          <h2>Book a Lesson with {tutor.name} {tutor.surname}</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {success && booking ? (
          <div className="booking-success">
            <div className="success-icon">✓</div>
            <h3>Booking Confirmed!</h3>
            <div className="booking-details">
              <p><strong>Date:</strong> {new Date(booking.lesson_date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {booking.lesson_time.substring(0, 5)}</p>
              <p><strong>Duration:</strong> {booking.duration} minutes</p>
              <p><strong>Rate:</strong> ${booking.rate}/hour</p>
              <p><strong>Total:</strong> ${((booking.rate * booking.duration) / 60).toFixed(2)}</p>
            </div>
            <div className="booking-actions">
              <button className="google-calendar-btn" onClick={handleAddToGoogleCalendar}>
                <Calendar size={18} /> Add to Google Calendar
              </button>
              <button className="close-success-btn" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="booking-form">
            {error && (
              <div className="booking-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label>
                <Calendar size={18} /> Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime("");
                }}
                min={today}
                required
              />
            </div>

            {selectedDate && (
              <div className="form-group">
                <label>
                  <Clock size={18} /> Select Time
                </label>
                {loading ? (
                  <p>Checking availability...</p>
                ) : availableSlots.length > 0 ? (
                  <div className="time-slots-grid">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        className={`time-slot-btn ${selectedTime === time ? 'selected' : ''}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="no-slots">No available slots for this date</p>
                )}
              </div>
            )}

            <div className="form-group">
              <label>Duration (minutes)</label>
              <select value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            <div className="form-group">
              <label>Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or topics you'd like to cover..."
                rows={3}
              />
            </div>

            {selectedDate && selectedTime && (
              <div className="booking-summary">
                <h4>Booking Summary</h4>
                <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Duration:</strong> {duration} minutes</p>
                <p><strong>Rate:</strong> ${tutor.rate}/hour</p>
                <p className="total"><strong>Total:</strong> ${((tutor.rate * duration) / 60).toFixed(2)}</p>
              </div>
            )}

            <div className="form-actions">
              <button type="button" onClick={onClose} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="book-btn" disabled={!selectedDate || !selectedTime || loading}>
                {loading ? "Booking..." : "Book Lesson"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default BookingComponent;

