const express = require("express");
const cors = require("cors"); // Allow frontend requests
const authRouter = require("./Routes/auth");
const tutorsRouter = require("./Routes/tutors");
const bookingsRouter = require("./Routes/bookings");
const coursesRouter = require("./Routes/courses");
const studentsRouter = require("./Routes/students");
const gradesRouter = require("./Routes/grades");
const paymentsRouter = require("./Routes/payments");
const assignmentsRouter = require("./Routes/assignments");

const app = express();
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
})); // Enable CORS
app.use(express.json()); // Parse JSON body

// Database connection is handled in db.js
// Import it to ensure it initializes
require("./db");

// API routes
app.use("/auth", authRouter);
app.use("/api/tutors", tutorsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/students", studentsRouter);
app.use("/api/grades", gradesRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/assignments", assignmentsRouter);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

app.use((req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'Route not found' });
});

app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  console.error('Unhandled error:', err);
  res.status(status).json({
    error: status === 500 ? 'INTERNAL_ERROR' : 'ERROR',
    message,
    details: process.env.NODE_ENV === 'production' ? undefined : (err.stack || String(err))
  });
});

// Start server
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
