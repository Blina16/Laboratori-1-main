const express = require('express');
const router = express.Router();
const db = require('../db');

// List students
router.get('/', async (req, res) => {
  try {
    const sql = 'SELECT id, first_name, last_name, email FROM students ORDER BY id DESC';
    const results = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Get single student
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const sql = 'SELECT id, first_name, last_name, email FROM students WHERE id = ?';
    const results = await db.query(sql, [id]);
    if (results.length === 0) return res.status(404).json({ error: 'NOT_FOUND', message: 'Student not found' });
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Create student
router.post('/', async (req, res) => {
  const { first_name, last_name, email } = req.body || {};
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'first_name, last_name and email are required' });
  }
  try {
    const sql = 'INSERT INTO students (first_name, last_name, email) VALUES (?, ?, ?)';
    const result = await db.query(sql, [first_name.trim(), last_name.trim(), email.trim()]);
    res.status(201).json({ id: result.insertId, first_name: first_name.trim(), last_name: last_name.trim(), email: email.trim() });
  } catch (err) {
    console.error('Error creating student:', err);
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ error: 'DB_ERROR', message: 'students table does not exist. Please create it in the SQL schema.' });
    }
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'DUPLICATE_ERROR', message: 'Email already exists' });
    }
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Update student
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email } = req.body || {};
  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'first_name, last_name and email are required' });
  }
  try {
    const sql = 'UPDATE students SET first_name = ?, last_name = ?, email = ? WHERE id = ?';
    await db.query(sql, [first_name.trim(), last_name.trim(), email.trim(), id]);
    const fetch = await db.query('SELECT id, first_name, last_name, email FROM students WHERE id = ?', [id]);
    if (fetch.length === 0) return res.status(404).json({ error: 'NOT_FOUND', message: 'Student not found' });
    res.json(fetch[0]);
  } catch (err) {
    console.error('Error updating student:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'DUPLICATE_ERROR', message: 'Email already exists' });
    }
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Delete student
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const exists = await db.query('SELECT id FROM students WHERE id = ?', [id]);
    if (exists.length === 0) return res.status(404).json({ error: 'NOT_FOUND', message: 'Student not found' });
    await db.query('DELETE FROM students WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting student:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

module.exports = router;
