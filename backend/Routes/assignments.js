const express = require('express');
const router = express.Router();
const db = require('../db');

// Helpers
const validStatus = new Set(['pending', 'in_progress', 'submitted', 'graded', 'completed', 'archived']);
const normalizeStatus = (value) => {
  if (!value) return 'pending';
  const lower = String(value).toLowerCase();
  return validStatus.has(lower) ? lower : null;
};

const normalize = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  status: row.status || 'pending',
  course_id: row.course_id || null,
  student_id: row.student_id || null,
  tutor_id: row.tutor_id || null,
  due_date: row.due_date || null,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

// GET /api/assignments
// Optional query: ?studentId=... to filter for a student
router.get('/', async (req, res) => {
  const { studentId } = req.query;
  try {
    const sql = studentId
      ? `SELECT id, title, description, status, course_id, student_id, tutor_id, due_date, created_at, updated_at FROM assignments WHERE student_id = ? ORDER BY due_date IS NULL, due_date ASC, created_at DESC`
      : `SELECT id, title, description, status, course_id, student_id, tutor_id, due_date, created_at, updated_at FROM assignments ORDER BY due_date IS NULL, due_date ASC, created_at DESC`;
    const rows = await db.query(sql, studentId ? [studentId] : []);
    res.json(rows.map(normalize));
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message || 'Failed to fetch assignments' });
  }
});

// GET single assignment
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `SELECT id, title, description, status, course_id, student_id, tutor_id, due_date, created_at, updated_at FROM assignments WHERE id = ?`;
    const rows = await db.query(sql, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND', message: 'Assignment not found' });
    res.json(normalize(rows[0]));
  } catch (err) {
    console.error('Error fetching assignment:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message || 'Failed to fetch assignment' });
  }
});

// CREATE assignment
router.post('/', async (req, res) => {
  const { title, description = '', status, course_id = null, student_id = null, tutor_id = null, due_date = null } = req.body || {};
  if (!title || title.trim() === '') return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Title is required' });
  const normalizedStatus = normalizeStatus(status);
  if (!normalizedStatus) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid status' });

  try {
    const sql = `INSERT INTO assignments (title, description, status, course_id, student_id, tutor_id, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const result = await db.query(sql, [title.trim(), description, normalizedStatus, course_id || null, student_id || null, tutor_id || null, due_date || null]);
    const created = {
      id: result.insertId,
      title: title.trim(),
      description,
      status: normalizedStatus,
      course_id: course_id || null,
      student_id: student_id || null,
      tutor_id: tutor_id || null,
      due_date: due_date || null,
      created_at: new Date(),
      updated_at: new Date()
    };
    res.status(201).json(created);
  } catch (err) {
    console.error('Error creating assignment:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message || 'Failed to create assignment' });
  }
});

// UPDATE assignment
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description = '', status, course_id = null, student_id = null, tutor_id = null, due_date = null } = req.body || {};
  if (!title || title.trim() === '') return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Title is required' });
  const normalizedStatus = normalizeStatus(status);
  if (!normalizedStatus) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid status' });

  try {
    const updateSql = `UPDATE assignments SET title = ?, description = ?, status = ?, course_id = ?, student_id = ?, tutor_id = ?, due_date = ?, updated_at = NOW() WHERE id = ?`;
    const result = await db.query(updateSql, [title.trim(), description, normalizedStatus, course_id || null, student_id || null, tutor_id || null, due_date || null, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'NOT_FOUND', message: 'Assignment not found' });
    const rows = await db.query('SELECT id, title, description, status, course_id, student_id, tutor_id, due_date, created_at, updated_at FROM assignments WHERE id = ?', [id]);
    res.json(normalize(rows[0]));
  } catch (err) {
    console.error('Error updating assignment:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message || 'Failed to update assignment' });
  }
});

// DELETE assignment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM assignments WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'NOT_FOUND', message: 'Assignment not found' });
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message || 'Failed to delete assignment' });
  }
});

module.exports = router;
