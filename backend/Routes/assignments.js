const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* =========================
   MULTER CONFIG
========================= */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg'
    ];
    cb(null, allowed.includes(file.mimetype));
  }
});

/* =========================
   HELPERS
========================= */
async function resolveStudentId(studentIdentifier) {
  if (!studentIdentifier) return null;
  const raw = String(studentIdentifier);
  const asNumber = Number(raw);
  if (Number.isInteger(asNumber) && String(asNumber) === raw) return asNumber;

  const email = raw.trim().toLowerCase();
  if (!email) return null;

  const existing = await db.query(
    'SELECT id FROM students WHERE email = ? LIMIT 1',
    [email]
  );
  if (existing.length > 0) return existing[0].id;

  const name = email.includes('@') ? email.split('@')[0] : 'Student';
  const created = await db.query(
    'INSERT INTO students (first_name, last_name, email) VALUES (?, ?, ?)',
    [name, '', email]
  );
  return created.insertId;
}

/* =========================
   GET ASSIGNMENTS (STUDENT)
========================= */
router.get('/', async (req, res) => {
  const { studentId } = req.query;

  try {
    const studentDbId = studentId
      ? await resolveStudentId(studentId)
      : null;

    // Fetch assignments
    let assignments = await db.query(
      `
      SELECT a.id, a.student_id, s.first_name AS student_first_name, s.last_name AS student_last_name,
             a.title, a.description, a.due_date, a.status, a.file_path, a.created_at
      FROM assignments a
      LEFT JOIN students s ON a.student_id = s.id
      ${studentDbId ? 'WHERE a.student_id = ?' : ''}
      ORDER BY a.due_date IS NULL, a.due_date ASC, a.id DESC
      `,
      studentDbId ? [studentDbId] : []
    );

    // Fetch files for all assignments
    const assignmentIds = assignments.map(a => a.id);
    let files = [];
    if (assignmentIds.length > 0) {
      files = await db.query(
        `SELECT id, assignment_id, file_path, uploaded_at
         FROM assignment_files
         WHERE assignment_id IN (${assignmentIds.join(',')})`
      );
    }

    // Attach files to assignments
    assignments = assignments.map(a => {
      a.files = files.filter(f => f.assignment_id === a.id);
      return a;
    });

    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

/* =========================
   CREATE ASSIGNMENT
========================= */
router.post('/', async (req, res) => {
  const { student_id, title, description, due_date, status } = req.body;

  const studentDbId = await resolveStudentId(student_id);
  if (!studentDbId || !title) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'student_id and title are required'
    });
  }

  try {
    const result = await db.query(
      `INSERT INTO assignments
       (student_id, title, description, due_date, status)
       VALUES (?, ?, ?, ?, ?)`,
      [studentDbId, title, description || '', due_date || null, status || 'pending']
    );

    const assignment = await db.query(
      'SELECT * FROM assignments WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(assignment[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

/* =========================
   UPLOAD MULTIPLE FILES
   (TEACHER)
========================= */
router.post('/:id/upload-files', upload.array('files', 10), async (req, res) => {
  const { id } = req.params;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'NO_FILES', message: 'No files uploaded' });
  }

  try {
    const insertPromises = req.files.map(file => {
      const filePath = file.path.replace(/\\/g, '/');
      return db.query(
        'INSERT INTO assignment_files (assignment_id, file_path) VALUES (?, ?)',
        [id, filePath]
      );
    });

    await Promise.all(insertPromises);

    // Fetch all files for this assignment
    const files = await db.query(
      'SELECT id, file_path, uploaded_at FROM assignment_files WHERE assignment_id = ?',
      [id]
    );

    res.json({ success: true, files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

/* =========================
   SUBMIT ASSIGNMENT (STUDENT)
========================= */
router.put('/:id/submit', upload.array('files', 10), async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await db.query('SELECT id FROM assignments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Assignment not found' });
    }

    // Handle multiple files
    if (req.files && req.files.length > 0) {
      // Insert all files into assignment_files table
      const insertPromises = req.files.map(file => {
        const filePath = file.path.replace(/\\/g, '/');
        return db.query(
          'INSERT INTO assignment_files (assignment_id, file_path, file_name, file_size, mime_type) VALUES (?, ?, ?, ?, ?)',
          [id, filePath, file.originalname, file.size, file.mimetype]
        );
      });
      await Promise.all(insertPromises);

      // Update assignment status to submitted
      await db.query(
        `UPDATE assignments
         SET status = 'submitted'
         WHERE id = ?`,
        [id]
      );
    } else {
      // No files submitted, just update status
      await db.query(
        `UPDATE assignments
         SET status = 'submitted'
         WHERE id = ?`,
        [id]
      );
    }

    const updated = await db.query('SELECT * FROM assignments WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

/* =========================
   UPDATE ASSIGNMENT
========================= */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { student_id, title, description, due_date, status } = req.body;

  const studentDbId = await resolveStudentId(student_id);
  if (!studentDbId || !title) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'student_id and title are required'
    });
  }

  try {
    await db.query(
      `UPDATE assignments
       SET student_id = ?, title = ?, description = ?, due_date = ?, status = ?
       WHERE id = ?`,
      [studentDbId, title, description || '', due_date || null, status || 'pending', id]
    );

    const updated = await db.query('SELECT * FROM assignments WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

/* =========================
   DELETE ASSIGNMENT
========================= */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM assignments WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB_ERROR', message: err.message });
  }
});

module.exports = router;
