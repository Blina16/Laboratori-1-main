const db = require('../db');

class AboutUsController {
  static async getAboutUs(req, res) {
    try {
      const results = await db.query('SELECT * FROM about_us LIMIT 1');
      res.status(200).json(results[0] || {});
    } catch (error) {
      console.error('Error fetching About Us:', error);
      res.status(500).json({ error: 'Failed to fetch About Us data' });
    }
  }

  static async updateAboutUs(req, res) {
    const { id, description } = req.body;
    try {
      if (id) {
          await db.query('UPDATE about_us SET description = ? WHERE id = ?', [description, id]);
      } else {
          // If no ID provided, update the first row or insert
           const existing = await db.query('SELECT id FROM about_us LIMIT 1');
           if (existing.length > 0) {
               await db.query('UPDATE about_us SET description = ? WHERE id = ?', [description, existing[0].id]);
           } else {
               await db.query('INSERT INTO about_us (description) VALUES (?)', [description]);
           }
      }
      res.status(200).json({ message: 'About Us updated successfully' });
    } catch (error) {
      console.error('Error updating About Us:', error);
      res.status(500).json({ error: 'Failed to update About Us data' });
    }
  }
}

module.exports = AboutUsController;