// Minimal auth helper (used by some demo code).
const express = require('express');
const router = express.Router();
const db = require('./db');

// Signup route (uses promise-style db.query)
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).send('Missing username or password');
    const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
    await db.query(query, [username, password]);
    res.status(201).send('User registered!');
  } catch (err) {
    console.error('Error signing up:', err);
    res.status(500).send('Error signing up');
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).send('Missing username or password');
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    const results = await db.query(query, [username, password]);
    if (Array.isArray(results) && results.length > 0) {
      res.send('Login successful!');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).send('Error logging in');
  }
});

module.exports = router;
