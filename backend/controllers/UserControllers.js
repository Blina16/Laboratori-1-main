const bcrypt = require('bcryptjs');
const db = require('../config/dbconfig');


class UserController {
  static async getAllUsers(req, res) {
    try {
      const [users] = await db.query('SELECT id, name, email, role FROM users_');
      res.json(users);
    } catch (err) {
      console.error('Error getting users:', err.message);
      res.status(500).json({ message: 'Database error' });
    }
  }

  static async getUsersByRole(req, res) {
    
    const role = parseInt(req.query.role);
    if (isNaN(role)) {
      return res.status(400).json({ message: 'Invalid role parameter' });
    }
    try {
      const [users] = await db.query('SELECT id, name, email, role FROM users_ WHERE role = ?', [role]);
      res.json(users);
    } catch (err) {
      console.error('Error getting users by role:', err.message);
      res.status(500).json({ message: 'Database error' });
    }
  }

  static async getUserById(req, res) {
    const { id } = req.params;
    try {
      const [users] = await db.query('SELECT id, name, email, role FROM users_ WHERE id = ?', [id]);
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(users[0]);
    } catch (err) {
      console.error('Error getting user:', err.message);
      res.status(500).json({ message: 'Database error' });
    }
  }

  static async createUser(req, res) {
    const { name, email, password, role = 0 } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
      const [existing] = await db.query('SELECT * FROM users_ WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(409).json({ message: 'Email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await db.query(
        'INSERT INTO users_ (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );
      res.status(201).json({ message: 'User created successfully!' });
    } catch (err) {
      console.error('Error creating user:', err.message);
      res.status(500).json({ message: 'Database error' });
    }
  }

  static async updateUser(req, res) {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    try {
      const [existing] = await db.query('SELECT * FROM users_ WHERE id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }

      let query = 'UPDATE users_ SET name = ?, email = ?';
      const params = [name, email];

      if (role !== undefined) {
        query += ', role = ?';
        params.push(role);
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query += ', password = ?';
        params.push(hashedPassword);
      }

      query += ' WHERE id = ?';
      params.push(id);

      await db.query(query, params);
      res.json({ message: 'User updated successfully!' });
    } catch (err) {
      console.error('Error updating user:', err.message);
      res.status(500).json({ message: 'Database error' });
    }
  }

  static async deleteUser(req, res) {
    const { id } = req.params;
    try {
      const [result] = await db.query('DELETE FROM users_ WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }
      res.json({ message: 'User deleted successfully!' });
    } catch (err) {
      console.error('Error deleting user:', err.message);
      res.status(500).json({ message: 'Database error' });
    }
  }
}

module.exports = UserController;
