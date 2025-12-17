const express = require('express');
const router = express.Router();
const db = require('../db');

// List reviews with optional filters: from_role, from_id, to_role, to_id, tutor_id, student_id
router.get('/', async (req, res) => {
  try {
    const { from_role, from_id, to_role, to_id, tutor_id, student_id } = req.query || {};
    const clauses = [];
    const values = [];

    if (from_role) { clauses.push('from_role = ?'); values.push(from_role); }
    if (from_id) { clauses.push('from_id = ?'); values.push(Number(from_id)); }
    if (to_role) { clauses.push('to_role = ?'); values.push(to_role); }
    if (to_id) { clauses.push('to_id = ?'); values.push(Number(to_id)); }
    if (tutor_id) { clauses.push('( (from_role = "tutor" AND from_id = ?) OR (to_role = "tutor" AND to_id = ?) )'); values.push(Number(tutor_id), Number(tutor_id)); }
    if (student_id) { clauses.push('( (from_role = "student" AND from_id = ?) OR (to_role = "student" AND to_id = ?) )'); values.push(Number(student_id), Number(student_id)); }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `SELECT id, from_role, from_id, to_role, to_id, rating, comment, created_at FROM reviews ${where} ORDER BY id DESC`;
    const results = await db.query(sql, values);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Create a review: { from_role: 'student'|'tutor', from_id, to_role, to_id, rating (1-5), comment }
router.post('/', async (req, res) => {
  try {
    const { from_role, from_id, to_role, to_id, rating, comment } = req.body || {};
    if (!from_role || !from_id || !to_role || !to_id || !rating) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Missing required fields' });
    }
    const sql = 'INSERT INTO reviews (from_role, from_id, to_role, to_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [String(from_role), Number(from_id), String(to_role), Number(to_id), Number(rating), comment || ''];
    const result = await db.query(sql, values);
    res.status(201).json({ id: result.insertId, from_role, from_id: Number(from_id), to_role, to_id: Number(to_id), rating: Number(rating), comment: comment || '' });
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Update a review (rating/comment)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body || {};
    const sql = 'UPDATE reviews SET rating = ?, comment = ? WHERE id = ?';
    await db.query(sql, [Number(rating), comment || '', Number(id)]);
    res.json({ id: Number(id), rating: Number(rating), comment: comment || '' });
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Delete a review
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'DELETE FROM reviews WHERE id = ?';
    await db.query(sql, [Number(id)]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

module.exports = router;
