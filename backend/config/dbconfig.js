const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    // Do not exit process here; allow app to run in fallback/dev mode.
    // Controllers handle DB errors and will use file-based fallbacks when appropriate.
    return;
  }
  console.log("MySQL connected");
});

module.exports = db.promise();
