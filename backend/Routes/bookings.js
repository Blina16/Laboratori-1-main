const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all bookings for a student
router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  try {
    const sql = `
      SELECT b.*, t.first_name AS tutor_name, t.last_name AS tutor_surname, t.rate 
      FROM bookings b 
      JOIN tutors t ON b.tutor_id = t.id 
      WHERE b.student_id = ? 
      ORDER BY b.lesson_date DESC, b.lesson_time DESC
    `;
    const results = await db.query(sql, [studentId]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'DB_ERROR', details: err.message });
  }
});

// Get all bookings for a tutor
router.get('/tutor/:tutorId', async (req, res) => {
  const { tutorId } = req.params;
  try {
    const sql = `
      SELECT b.*, b.student_id 
      FROM bookings b 
      WHERE b.tutor_id = ? 
      ORDER BY b.lesson_date DESC, b.lesson_time DESC
    `;
    const results = await db.query(sql, [tutorId]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching tutor bookings:', err);
    res.status(500).json({ error: 'DB_ERROR', details: err.message });
  }
});

// Check availability for a tutor on a specific date
router.get('/availability/:tutorId/:date', async (req, res) => {
  const { tutorId, date } = req.params;
  
  // Validate date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'INVALID_DATE', message: 'Date must be in YYYY-MM-DD format' });
  }
  
  try {
    // Get existing bookings for that date
    const bookingsSql = `
      SELECT lesson_time, duration 
      FROM bookings 
      WHERE tutor_id = ? AND lesson_date = ? AND status != 'cancelled'
    `;
    const bookings = await db.query(bookingsSql, [tutorId, date]);
    
    // Get tutor's general availability
    const dayOfWeek = new Date(date).getDay();
    const availabilitySql = `
      SELECT start_time, end_time 
      FROM tutor_availability 
      WHERE tutor_id = ? AND day_of_week = ?
    `;
    const availability = await db.query(availabilitySql, [tutorId, dayOfWeek]);
    
    res.json({ bookings, availability });
  } catch (err) {
    console.error('Error checking availability:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message, details: err });
  }
});

// Create a new booking
router.post('/', async (req, res) => {
  const { studentId, tutorId, lessonDate, lessonTime, duration, notes } = req.body;
  
  if (!studentId || !tutorId || !lessonDate || !lessonTime) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Missing required fields' });
  }
  
  try {
    // Check if slot is already booked
    const checkSql = `
      SELECT id FROM bookings 
      WHERE tutor_id = ? AND lesson_date = ? AND lesson_time = ? AND status != 'cancelled'
    `;
    const existing = await db.query(checkSql, [tutorId, lessonDate, lessonTime]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'SLOT_BOOKED', message: 'This time slot is already booked' });
    }
    
    const sql = `
      INSERT INTO bookings (student_id, tutor_id, lesson_date, lesson_time, duration, notes, status) 
      VALUES (?, ?, ?, ?, ?, ?, 'confirmed')
    `;
    const result = await db.query(sql, [studentId, tutorId, lessonDate, lessonTime, duration || 60, notes || '']);
    
    // Fetch the created booking with tutor info
    const fetchSql = `
      SELECT b.*, t.first_name AS tutor_name, t.last_name AS tutor_surname, t.rate 
      FROM bookings b 
      JOIN tutors t ON b.tutor_id = t.id 
      WHERE b.id = ?
    `;
    const booking = await db.query(fetchSql, [result.insertId]);
    
    res.status(201).json(booking[0]);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'DB_ERROR', details: err.message });
  }
});

// Update booking status
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'INVALID_STATUS', message: 'Invalid status' });
  }
  
  try {
    const sql = 'UPDATE bookings SET status = ? WHERE id = ?';
    await db.query(sql, [status, id]);
    res.json({ success: true, message: 'Booking status updated' });
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ error: 'DB_ERROR', details: err.message });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const sql = 'DELETE FROM bookings WHERE id = ?';
    await db.query(sql, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ error: 'DB_ERROR', details: err.message });
  }
});

module.exports = router;

