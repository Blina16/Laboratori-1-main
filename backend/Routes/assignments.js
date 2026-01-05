const express = require('express');
const router = express.Router();
const db = require('../db');

async function resolveStudentId(studentIdentifier) {
  if (studentIdentifier == null) return null;
  const raw = String(studentIdentifier);
  const asNumber = Number(raw);
  if (Number.isInteger(asNumber) && String(asNumber) === raw) return asNumber;
  const email = raw.trim().toLowerCase();
  if (!email) return null;
  const existing = await db.query('SELECT id FROM students WHERE email = ? LIMIT 1', [email]);
  if (Array.isArray(existing) && existing.length > 0) return existing[0].id;
  const name = email.includes('@') ? email.split('@')[0] : 'Student';
  const created = await db.query('INSERT INTO students (first_name, last_name, email) VALUES (?, ?, ?)', [name, '', email]);
  return created.insertId;
}

router.get('/', async (req, res) => {
  const { studentId } = req.query;
  try {
    const studentDbId = studentId ? await resolveStudentId(studentId) : null;
    const sql = `
      SELECT a.id, a.student_id, s.first_name AS student_first_name, s.last_name AS student_last_name,
             a.title, a.description, a.due_date, a.status, a.created_at
      FROM assignments a
      LEFT JOIN students s ON a.student_id = s.id
      ${studentDbId ? 'WHERE a.student_id = ?' : ''}
      ORDER BY a.due_date IS NULL, a.due_date ASC, a.id DESC
    `;

    const results = await db.query(sql, studentDbId ? [studentDbId] : []);
    res.json(results);
  } catch (err) {
    console.error('Error fetching assignments:', err);
    if (err.code === 'ER_NO_SUCH_TABLE' || (err.message && err.message.includes('no such table'))) {
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'assignments table does not exist. Please create it in the SQL schema.'
      });
    }
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

router.post('/', async (req, res) => {
  const { student_id, title, description, due_date, status } = req.body || {};

  const studentDbId = await resolveStudentId(student_id);

  if (!studentDbId || !title) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'student_id and title are required'
    });
  }

  try {
    const sql = `
      INSERT INTO assignments (student_id, title, description, due_date, status)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await db.query(sql, [
      studentDbId,
      title.toString(),
      (description || '').toString(),
      due_date || null,
      (status || 'pending').toString()
    ]);

    const fetch = await db.query(
      'SELECT id, student_id, title, description, due_date, status, created_at FROM assignments WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(fetch[0]);
  } catch (err) {
    console.error('Error creating assignment:', err);
    if (err.code === 'ER_NO_SUCH_TABLE' || (err.message && err.message.includes('no such table'))) {
      return res.status(500).json({
        error: 'DB_ERROR',
        message: 'assignments table does not exist. Please create it in the SQL schema.'
      });
    }
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { student_id, title, description, due_date, status } = req.body || {};

  const studentDbId = await resolveStudentId(student_id);

  if (!studentDbId || !title) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'student_id and title are required'
    });
  }

  try {
    const sql = `
      UPDATE assignments
      SET student_id = ?, title = ?, description = ?, due_date = ?, status = ?
      WHERE id = ?
    `;

    await db.query(sql, [
      studentDbId,
      title.toString(),
      (description || '').toString(),
      due_date || null,
      (status || 'pending').toString(),
      id
    ]);

    const fetch = await db.query(
      'SELECT id, student_id, title, description, due_date, status, created_at FROM assignments WHERE id = ?',
      [id]
    );
    if (fetch.length === 0) return res.status(404).json({ error: 'NOT_FOUND', message: 'Assignment not found' });
    res.json(fetch[0]);
  } catch (err) {
    console.error('Error updating assignment:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const exists = await db.query('SELECT id FROM assignments WHERE id = ?', [id]);
    if (exists.length === 0) return res.status(404).json({ error: 'NOT_FOUND', message: 'Assignment not found' });
    await db.query('DELETE FROM assignments WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

module.exports = router;
