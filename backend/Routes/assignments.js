const express = require('express');
const router = express.Router();
const db = require('../db');

// Helpers
const normalize = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  due_date: row.due_date,
  status: row.status || 'pending',
  course_id: row.course_id,
  student_id: row.student_id,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

// GET /api/assignments
// Optional query: ?studentId=... to filter for a student
router.get('/', async (req, res) => {
  const { studentId } = req.query;
  try {
    const sql = studentId
      ? `SELECT * FROM assignments WHERE student_id = ? ORDER BY due_date IS NULL, due_date ASC, created_at DESC`
      : `SELECT * FROM assignments ORDER BY due_date IS NULL, due_date ASC, created_at DESC`;
    const results = await db.query(sql, studentId ? [studentId] : []);
    res.json(results.map(normalize));
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({
      error: 'DB_ERROR',
      message: err.message || 'Failed to fetch assignments',
      details: err,
    });
  }
});

// POST /api/assignments
router.post('/', async (req, res) => {
  const { title, description, due_date, course_id, student_id, status = 'pending' } = req.body || {};

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Title is required' });
  }

  if (status && !['pending', 'in_progress', 'completed', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid status' });
  }

  try {
    const sql = `
      INSERT INTO assignments (title, description, due_date, course_id, student_id, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await db.query(sql, [
      title.trim(),
      description || '',
      due_date || null,
      course_id || null,
      student_id || null,
      status || 'pending',
    ]);

    const fetchSql = `SELECT * FROM assignments WHERE id = ?`;
    const [created] = await db.query(fetchSql, [result.insertId]);
    res.status(201).json(normalize(created));
  } catch (err) {
    console.error('Error creating assignment:', err);

    if (err.code === 'ER_NO_SUCH_TABLE' || (err.message || '').includes("doesn't exist")) {
      return res.status(500).json({
        error: 'DB_ERROR',
        message:
          'Assignments table does not exist. Create it with:\n' +
          'CREATE TABLE assignments (\n' +
          '  id INT AUTO_INCREMENT PRIMARY KEY,\n' +
          '  title VARCHAR(255) NOT NULL,\n' +
          '  description TEXT,\n' +
          '  due_date DATE NULL,\n' +
          '  course_id INT NULL,\n' +
          '  student_id VARCHAR(255) NULL,\n' +
          "  status ENUM('pending','in_progress','completed','archived') DEFAULT 'pending',\n" +
          '  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n' +
          '  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n' +
          ');',
        details: err.message,
      });
    }

    res.status(500).json({
      error: 'DB_ERROR',
      message: err.message || 'Failed to create assignment',
      details: err.code || err.message,
    });
  }
});

// PUT /api/assignments/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, course_id, student_id, status } = req.body || {};

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Title is required' });
  }

  if (status && !['pending', 'in_progress', 'completed', 'archived'].includes(status)) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Invalid status' });
  }

  try {
    const sql = `
      UPDATE assignments
      SET title = ?, description = ?, due_date = ?, course_id = ?, student_id = ?, status = ?
      WHERE id = ?
    `;
    await db.query(sql, [
      title.trim(),
      description || '',
      due_date || null,
      course_id || null,
      student_id || null,
      status || 'pending',
      id,
    ]);

    const fetchSql = `SELECT * FROM assignments WHERE id = ?`;
    const updated = await db.query(fetchSql, [id]);
    if (updated.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Assignment not found' });
    }
    res.json(normalize(updated[0]));
  } catch (err) {
    console.error('Error updating assignment:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// DELETE /api/assignments/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const checkSql = 'SELECT id FROM assignments WHERE id = ?';
    const exists = await db.query(checkSql, [id]);
    if (exists.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Assignment not found' });
    }

    const sql = 'DELETE FROM assignments WHERE id = ?';
    await db.query(sql, [id]);
    res.json({ success: true, message: 'Assignment deleted successfully' });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../db');

// Helpers
const validStatus = new Set(['pending', 'submitted', 'graded']);
const normalizeStatus = (value) => {
  if (!value) return 'pending';
  const lower = String(value).toLowerCase();
  return validStatus.has(lower) ? lower : null;
};

// GET all assignments (basic list, sorted by due date then created)
router.get('/', async (_req, res) => {
  try {
    const sql = `
      SELECT id, title, description, status, course_id, student_id, tutor_id, due_date, created_at, updated_at
      FROM assignments
      ORDER BY due_date IS NULL, due_date ASC, created_at DESC
    `;
    const rows = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message || 'Failed to fetch assignments' });
  }
});

// GET single assignment
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT id, title, description, status, course_id, student_id, tutor_id, due_date, created_at, updated_at
      FROM assignments
      WHERE id = ?
    `;
    const rows = await db.query(sql, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Assignment not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching assignment:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message || 'Failed to fetch assignment' });
  }
});

// CREATE assignment
router.post('/', async (req, res) => {
  const { title, description = '', status, course_id = null, student_id = null, tutor_id = null, due_date = null } = req.body || {};

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Title is required' });
  }

  const normalizedStatus = normalizeStatus(status);
  if (!normalizedStatus) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Status must be pending, submitted, or graded' });
  }

  try {
    const sql = `
      INSERT INTO assignments (title, description, status, course_id, student_id, tutor_id, due_date, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const result = await db.query(sql, [
      title.trim(),
      description,
      normalizedStatus,
      course_id || null,
      student_id || null,
      tutor_id || null,
      due_date || null
    ]);

    res.status(201).json({
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
    });
  } catch (err) {
    console.error('Error creating assignment:', err);
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'Assignments table does not exist. Please create it using the SQL migration.',
        details: err.message
      });
    }
    res.status(500).json({ error: 'DB_ERROR', message: err.message || 'Failed to create assignment' });
  }
});

// UPDATE assignment
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description = '', status, course_id = null, student_id = null, tutor_id = null, due_date = null } = req.body || {};

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Title is required' });
  }

  const normalizedStatus = normalizeStatus(status);
  if (!normalizedStatus) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Status must be pending, submitted, or graded' });
  }

  try {
    const updateSql = `
      UPDATE assignments
      SET title = ?, description = ?, status = ?, course_id = ?, student_id = ?, tutor_id = ?, due_date = ?, updated_at = NOW()
      WHERE id = ?
    `;
    const result = await db.query(updateSql, [
      title.trim(),
      description,
      normalizedStatus,
      course_id || null,
      student_id || null,
      tutor_id || null,
      due_date || null,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Assignment not found' });
    }

    const fetchSql = `
      SELECT id, title, description, status, course_id, student_id, tutor_id, due_date, created_at, updated_at
      FROM assignments
      WHERE id = ?
    `;
    const rows = await db.query(fetchSql, [id]);
    res.json(rows[0]);
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
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Assignment not found' });
    }
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message || 'Failed to delete assignment' });
  }
});

module.exports = router;
