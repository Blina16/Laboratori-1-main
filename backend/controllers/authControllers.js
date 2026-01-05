const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const fs = require('fs');
const path = require('path');

class AuthController {
  static async login(req, res) {
    const { email, password } = req.body;

    try {
      const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);

      if (users.length === 0) {
        return res.status(401).json({ message: 'Incorrect email or password.' });
      }

      const user = users[0];
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        }
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', 
        maxAge: 24 * 60 * 60 * 1000 
      });

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        }
      });

    } catch (err) {
      console.error('Error during login (DB):', err.message);
      // Fallback for local/dev testing: check backend/users.json if DB is unavailable
      try {
        const usersFile = path.join(__dirname, '..', 'users.json');
        if (fs.existsSync(usersFile)) {
          const raw = fs.readFileSync(usersFile, 'utf8');
          const cleaned = raw.replace(/^\uFEFF/, '');
          const usersList = JSON.parse(cleaned);
          const user = usersList.find(u => u.email === email);
          if (!user) return res.status(401).json({ message: 'Incorrect email or password.' });
          const validPassword = await bcrypt.compare(password, user.password);
          if (!validPassword) return res.status(401).json({ message: 'Incorrect password' });

          const token = jwt.sign(
            { id: user.id || null, email: user.email, role: user.role || 0 },
            process.env.JWT_SECRET || 'dev_secret',
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
          );

          return res.json({
            message: 'Login successful (dev fallback)',
            token,
            user: { id: user.id || null, email: user.email, role: user.role || 0, name: user.name || null }
          });
        }
      } catch (fsErr) {
        console.error('Fallback auth error:', fsErr.message);
      }

      res.status(500).json({ message: 'Error while processing the request.' });
    }
  }

  static async signup(req, res) {
    const { email, password, name, role, adminSecret } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
      const existingUser = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (existingUser.length > 0) {
        return res.status(409).json({ message: 'Email already exists.' });
      }

      let userRole = 'student';
      if (role === 'admin') {
          // Simple hardcoded secret for demonstration
          if (adminSecret !== 'admin123') {
              return res.status(403).json({ message: 'Invalid admin secret key.' });
          }
          userRole = 'admin';
      } else if (role === 'tutor') {
          userRole = 'tutor';
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      // Use email as username to satisfy DB constraint if username column exists and is NOT NULL
      const username = email; 
      
      try {
          await db.query(
            'INSERT INTO users (name, email, password, role, username) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, userRole, username] 
          );
      } catch (insertErr) {
          // If username column doesn't exist, try without it (backward compatibility if schema changed differently)
          if (insertErr.message && insertErr.message.includes('no such column: username')) {
              await db.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, userRole] 
              );
          } else {
              throw insertErr;
          }
      }

      res.status(201).json({ message: 'User was successfully registered.', role: userRole });
    } catch (err) {
      console.error('Error during registration:', err.message);
      res.status(500).json({ message: 'Error while processing registration.' });
    }
  }

  static async logout(req, res) {
    try {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      return res.json({ message: 'Logout successful' });
    } catch (err) {
      console.error('Error during logout:', err.message);
      res.status(500).json({ message: 'Error while processing logout.' });
    }
  }
}

module.exports = AuthController;
