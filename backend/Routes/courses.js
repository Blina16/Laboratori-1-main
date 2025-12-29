const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const sql = 'SELECT id, name, description, category, created_at, updated_at FROM courses ORDER BY name ASC';
    const results = await db.query(sql);
    res.json(results);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ 
      error: 'DB_ERROR', 
      message: err.message || 'Failed to fetch courses',
      details: err.code || err.message 
    });
  }
});

// Get tutors who teach a specific course
router.get('/:courseId/tutors', async (req, res) => {
  try {
    const { courseId } = req.params;
    const sql = `
      SELECT t.id, t.first_name AS name, t.last_name AS surname, t.description AS bio, t.rate
      FROM tutors t
      INNER JOIN tutor_courses tc ON t.id = tc.tutor_id
      WHERE tc.course_id = ?
      ORDER BY t.first_name, t.last_name
    `;
    const results = await db.query(sql, [courseId]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching tutors for course:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Get courses for a specific tutor (must be before /:id route)
router.get('/tutor/:tutorId', async (req, res) => {
  try {
    const { tutorId } = req.params;
    const sql = `
      SELECT c.id, c.name, c.description, c.category 
      FROM courses c
      INNER JOIN tutor_courses tc ON c.id = tc.course_id
      WHERE tc.tutor_id = ?
      ORDER BY c.name ASC
    `;
    const results = await db.query(sql, [tutorId]);
    res.json(results);
  } catch (err) {
    console.error('Error fetching tutor courses:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Get single course by id (must be after /tutor/:tutorId)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Don't match 'tutor' as an id
    if (id === 'tutor') {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Course not found' });
    }
    const sql = 'SELECT id, name, description, category, created_at, updated_at FROM courses WHERE id = ?';
    const results = await db.query(sql, [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Course not found' });
    }
    
    res.json(results[0]);
  } catch (err) {
    console.error('Error fetching course:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Create a new course
router.post('/', async (req, res) => {
  const { name, description, category } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Course name is required' });
  }
  
  try {
    const sql = 'INSERT INTO courses (name, description, category) VALUES (?, ?, ?)';
    const result = await db.query(sql, [name.trim(), description || '', category || '']);
    
    const newCourse = {
      id: result.insertId,
      name: name.trim(),
      description: description || '',
      category: category || '',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    res.status(201).json(newCourse);
  } catch (err) {
    console.error('Error creating course:', err);
    
    // Handle table doesn't exist error
    if (err.code === 'ER_NO_SUCH_TABLE' || err.message.includes("doesn't exist") || err.message.includes('Table')) {
      return res.status(500).json({ 
        error: 'DB_ERROR', 
        message: 'Courses table does not exist. Please create it using the SQL in MySQL local.session.sql',
        details: err.message 
      });
    }
    
    // Handle duplicate course name error
    if (err.code === 'ER_DUP_ENTRY' || err.message.includes('unique_course_name')) {
      return res.status(400).json({ error: 'DUPLICATE_ERROR', message: 'A course with this name already exists' });
    }
    
    res.status(500).json({ 
      error: 'DB_ERROR', 
      message: err.message || 'Failed to create course',
      details: err.code || err.message 
    });
  }
});

// Update course by id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, category } = req.body;
  
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Course name is required' });
  }
  
  try {
    const sql = 'UPDATE courses SET name = ?, description = ?, category = ? WHERE id = ?';
    await db.query(sql, [name.trim(), description || '', category || '', id]);
    
    // Fetch updated course
    const fetchSql = 'SELECT id, name, description, category, created_at, updated_at FROM courses WHERE id = ?';
    const updated = await db.query(fetchSql, [id]);
    
    if (updated.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Course not found' });
    }
    
    res.json(updated[0]);
  } catch (err) {
    console.error('Error updating course:', err);
    
    if (err.code === 'ER_DUP_ENTRY' || err.message.includes('unique_course_name')) {
      return res.status(400).json({ error: 'DUPLICATE_ERROR', message: 'A course with this name already exists' });
    }
    
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Delete course by id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if course exists
    const checkSql = 'SELECT id FROM courses WHERE id = ?';
    const exists = await db.query(checkSql, [id]);
    
    if (exists.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Course not found' });
    }
    
    // Delete the course (CASCADE will handle tutor_courses)
    const sql = 'DELETE FROM courses WHERE id = ?';
    await db.query(sql, [id]);
    
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Assign course to tutor
router.post('/tutor/:tutorId/course/:courseId', async (req, res) => {
  try {
    const { tutorId, courseId } = req.params;
    const sql = 'INSERT INTO tutor_courses (tutor_id, course_id) VALUES (?, ?)';
    await db.query(sql, [tutorId, courseId]);
    res.status(201).json({ success: true, message: 'Course assigned to tutor' });
  } catch (err) {
    console.error('Error assigning course:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'DUPLICATE_ERROR', message: 'Course already assigned to this tutor' });
    }
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

// Remove course from tutor
router.delete('/tutor/:tutorId/course/:courseId', async (req, res) => {
  try {
    const { tutorId, courseId } = req.params;
    const sql = 'DELETE FROM tutor_courses WHERE tutor_id = ? AND course_id = ?';
    await db.query(sql, [tutorId, courseId]);
    res.json({ success: true, message: 'Course removed from tutor' });
  } catch (err) {
    console.error('Error removing course:', err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

module.exports = router;

