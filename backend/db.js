const mysql = require('mysql2');
require('dotenv').config();

// Use connection pool instead of single connection to prevent "connection closed" errors
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'Blina',
  password: process.env.DB_PASSWORD || '1234567',
  database: process.env.DB_NAME || 'lab111',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    return;
  }
  console.log('Pershendetje Blina Databaza po punon shume mire :)');
  connection.release(); // Release the connection back to the pool
});

// Export the pool with a promise wrapper for easier use
const db = {
  query: (sql, params) => {
    return new Promise((resolve, reject) => {
      pool.query(sql, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
};

module.exports = db;
//hi new over here