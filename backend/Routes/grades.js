const express = require('express');
const router = express.Router();
const db = require('../db');

// List all grades
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT g.id, g.student_id, s.first_name AS student_first_name, s.last_name AS student_last_name,
             g.course_id, c.name AS course_name, g.grade_value, g.comments, g.created_at
      FROM grades g
      LEFT JOIN students s ON g.student_id = s.id
      LEFT JOIN courses c ON g.course_id = c.id
      ORDER BY g.created_at DESC, g.id DESC`;
    const results = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error fetching grades:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Get grades by student
router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  try {
    const sql = `
      SELECT g.id, g.student_id, g.course_id, g.grade_value, g.comments, g.created_at,
             c.name AS course_name
      FROM grades g
      LEFT JOIN courses c ON g.course_id = c.id
      WHERE g.student_id = ?
      ORDER BY g.created_at DESC`;
    const results = await db.query(sql, [studentId]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching student grades:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Get single grade
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const sql = 'SELECT id, student_id, course_id, grade_value, comments, created_at FROM grades WHERE id = ?';
    const results = await db.query(sql, [id]);
    if (results.length === 0) return res.status(404).json({ error: 'NOT_FOUND', message: 'Grade not found' });
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching grade:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Create grade
router.post('/', async (req, res) => {
  const { student_id, course_id, grade_value, comments } = req.body || {};
  if (!student_id || !grade_value) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'student_id and grade_value are required' });
  }
  try {
    const sql = 'INSERT INTO grades (student_id, course_id, grade_value, comments) VALUES (?, ?, ?, ?)';
    const result = await db.query(sql, [student_id, course_id || null, String(grade_value), comments || '']);
    const fetch = await db.query('SELECT id, student_id, course_id, grade_value, comments, created_at FROM grades WHERE id = ?', [result.insertId]);
    res.status(201).json(fetch[0]);
  } catch (err) {
    console.error('Error creating grade:', err);
    if (err.code === 'ER_NO_SUCH_TABLE' || (err.message && err.message.includes('no such table'))) {
      return res.status(500).json({ error: 'DB_ERROR', message: 'grades table does not exist. Please create it in the SQL schema.' });
    }
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Update grade
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { student_id, course_id, grade_value, comments } = req.body || {};
  if (!student_id || !grade_value) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'student_id and grade_value are required' });
  }
  try {
    const sql = 'UPDATE grades SET student_id = ?, course_id = ?, grade_value = ?, comments = ? WHERE id = ?';
    await db.query(sql, [student_id, course_id || null, String(grade_value), comments || '', id]);
    const fetch = await db.query('SELECT id, student_id, course_id, grade_value, comments, created_at FROM grades WHERE id = ?', [id]);
    if (fetch.length === 0) return res.status(404).json({ error: 'NOT_FOUND', message: 'Grade not found' });
    res.json(fetch[0]);
  } catch (err) {
    console.error('Error updating grade:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Delete grade
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const exists = await db.query('SELECT id FROM grades WHERE id = ?', [id]);
    if (exists.length === 0) return res.status(404).json({ error: 'NOT_FOUND', message: 'Grade not found' });
    await db.query('DELETE FROM grades WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting grade:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

module.exports = router;
