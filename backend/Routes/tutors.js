const express = require('express');
const router = express.Router();
const db = require('../db');

// List tutors (normalized to API shape)
router.get('/', async (req, res) => {
  try {
    const sql = 'SELECT id, first_name AS name, last_name AS surname, description AS bio, rate FROM tutors ORDER BY id DESC';
    const results = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error fetching tutors:', err);
    const errorMessage = err.message || 'Unknown database error';
    const isConnectionError = errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ER_ACCESS_DENIED') || errorMessage.includes('connect');
    
    res.status(500).json({ 
      error: 'DB_ERROR', 
      message: isConnectionError 
        ? 'Cannot connect to MySQL database. Please make sure MySQL server is running.' 
        : errorMessage,
      details: err.message 
    });
  }
});

// Create tutor (expects { name, surname, bio, rate })
router.post('/', async (req, res) => {
  console.log('POST /api/tutors - Request body:', req.body);
  const { name, surname, bio, rate } = req.body || {};
  
  if (!name || !surname) {
    console.log('Validation error: name or surname missing');
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'name and surname are required' });
  }
  
  const sql = 'INSERT INTO tutors (first_name, last_name, description, rate) VALUES (?, ?, ?, ?)';
  const values = [name, surname, bio || '', Number(rate) || 0];
  console.log('Executing SQL with values:', values);
  
  try {
    const result = await db.query(sql, values);
    console.log('Tutor created successfully with ID:', result.insertId);
    res.status(201).json({ id: result.insertId, name, surname, bio: bio || '', rate: Number(rate) || 0 });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message, details: err });
  }
});

// Update tutor by id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, surname, bio, rate } = req.body || {};
  const sql = 'UPDATE tutors SET first_name = ?, last_name = ?, description = ?, rate = ? WHERE id = ?';
  
  try {
    await db.query(sql, [name || '', surname || '', bio || '', Number(rate) || 0, id]);
    res.json({ id, name: name || '', surname: surname || '', bio: bio || '', rate: Number(rate) || 0 });
  } catch (err) {
    console.error('Error updating tutor:', err);
    res.status(500).json({ error: 'DB_ERROR', details: err.message });
  }
});

// Delete tutor by id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM tutors WHERE id = ?';
  
  try {
    await db.query(sql, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting tutor:', err);
    res.status(500).json({ error: 'DB_ERROR', details: err.message });
  }
});

module.exports = router;
