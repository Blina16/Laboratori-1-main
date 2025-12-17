// auth.js
const express = require('express');
const router = express.Router();
const db = require('./db');  // your db connection

// Signup route
router.post('/signup', (req, res) => {
  const { username, password } = req.body;

  const query = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(query, [username, password], (err, result) => {
    if (err) return res.status(500).send('Error signing up');
    res.send('User registered!');
  });
});

// Login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).send('Error logging in');
    if (results.length > 0) {
      res.send('Login successful!');
    } else {
      res.status(401).send('Invalid credentials');
    }
  });
});

module.exports = router;
