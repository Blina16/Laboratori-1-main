const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all payments (admin use)
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT p.id, p.student_id, s.first_name, s.last_name, p.amount, p.currency, p.method, p.status, p.reference, p.created_at
      FROM payments p
      LEFT JOIN students s ON s.id = p.student_id
      ORDER BY p.created_at DESC, p.id DESC`;
    const rows = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Get payments by student
router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  try {
    const sql = `SELECT id, student_id, amount, currency, method, status, reference, created_at FROM payments WHERE student_id = ? ORDER BY created_at DESC`;
    const rows = await db.query(sql, [studentId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Create payment
router.post('/', async (req, res) => {
  const { student_id, amount, currency, method, status, reference } = req.body || {};
  if (!student_id || amount == null) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'student_id and amount are required' });
  }
  try {
    const sql = `INSERT INTO payments (student_id, amount, currency, method, status, reference) VALUES (?,?,?,?,?,?)`;
    const result = await db.query(sql, [student_id, Number(amount), currency || 'USD', method || 'manual', status || 'paid', reference || '']);
    const rows = await db.query('SELECT id, student_id, amount, currency, method, status, reference, created_at FROM payments WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({ error: 'DB_ERROR', message: 'payments table does not exist. Please create it in the SQL schema.' });
    }
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { student_id, amount, currency, method, status, reference } = req.body || {};
  if (!student_id || amount == null) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'student_id and amount are required' });
  }
  try {
    const sql = `UPDATE payments SET student_id=?, amount=?, currency=?, method=?, status=?, reference=? WHERE id=?`;
    await db.query(sql, [student_id, Number(amount), currency || 'USD', method || 'manual', status || 'paid', reference || '', id]);
    const rows = await db.query('SELECT id, student_id, amount, currency, method, status, reference, created_at FROM payments WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'NOT_FOUND', message: 'Payment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const exists = await db.query('SELECT id FROM payments WHERE id = ?', [id]);
    if (exists.length === 0) return res.status(404).json({ error: 'NOT_FOUND', message: 'Payment not found' });
    await db.query('DELETE FROM payments WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

module.exports = router;
