const express = require("express");
const cors = require("cors"); // Allow frontend requests
const authRouter = require("./Routes/auth");
const tutorsRouter = require("./Routes/tutors");
const bookingsRouter = require("./Routes/bookings");
const coursesRouter = require("./Routes/courses");
const studentsRouter = require("./Routes/students");
const gradesRouter = require("./Routes/grades");
const paymentsRouter = require("./Routes/payments");

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

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(5000, () => console.log("Server running on port 5000"));
