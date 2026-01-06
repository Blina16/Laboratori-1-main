require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 5000;

// Configure CORS to allow the React dev server by default
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: corsOrigin, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
const mainRoutes = require('./routes');
app.use('/api', mainRoutes);

// Mount modular routes
const tutors = require('./Routes/tutors');
const students = require('./Routes/students');
const grades = require('./Routes/grades');
const courses = require('./Routes/courses');
const bookings = require('./Routes/bookings');
const auth = require('./Routes/auth');
const assignments = require('./Routes/assignments');
const aboutUs = require('./Routes/aboutUs');

app.use('/api/tutors', tutors);
app.use('/api/students', students);
app.use('/api/grades', grades);
app.use('/api/courses', courses);
app.use('/api/bookings', bookings);
app.use('/api/auth', auth);
// Also mount auth at /auth for frontend compatibility (frontend posts to /auth/*)
app.use('/auth', auth);
app.use('/api/assignments', assignments);
app.use('/api/about-us', aboutUs);

// Simple health check
app.get('/', (req, res) => res.send('Backend running'));

// Serve static frontend build in production (optional)
if (process.env.SERVE_STATIC === 'true') {
    const staticPath = path.join(__dirname, '..', 'frontend', 'build');
    app.use(express.static(staticPath));
    app.get('*', (req, res) => res.sendFile(path.join(staticPath, 'index.html')));
}

app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT} (CORS origin: ${corsOrigin})`);
});

module.exports = app;
