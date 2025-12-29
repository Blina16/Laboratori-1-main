const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Test the connection
db.prepare('SELECT 1').get();
console.log('✅ Connected to SQLite database');

// Create tables if they don't exist
const createTables = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tutors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    subject TEXT,
    phone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add other tables as needed
`;

db.exec(createTables);
console.log('✅ Database tables ready');

module.exports = {
    query: (sql, params = []) => {
        try {
            const stmt = db.prepare(sql);
            if (sql.trim().toLowerCase().startsWith('select')) {
                return params.length ? stmt.all(params) : stmt.all();
            }
            return params.length ? stmt.run(params) : stmt.run();
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    },
    // Add a helper for transactions if needed
    transaction: (queries) => {
        const result = [];
        db.exec('BEGIN TRANSACTION');
        try {
            for (const { sql, params = [] } of queries) {
                const stmt = db.prepare(sql);
                result.push(stmt.run(params));
            }
            db.exec('COMMIT');
            return result;
        } catch (error) {
            db.exec('ROLLBACK');
            throw error;
        }
    }
};

// Export the database instance and query function
module.exports = {
    query: (sql, params = []) => {
        try {
            const stmt = db.prepare(sql);
            if (sql.trim().toLowerCase().startsWith('select')) {
                return params.length ? stmt.all(params) : stmt.all();
            }
            return params.length ? stmt.run(params) : stmt.run();
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    },
    // Helper for transactions
    transaction: (queries) => {
        const result = [];
        db.exec('BEGIN TRANSACTION');
        try {
            for (const { sql, params = [] } of queries) {
                const stmt = db.prepare(sql);
                result.push(stmt.run(params));
            }
            db.exec('COMMIT');
            return result;
        } catch (error) {
            db.exec('ROLLBACK');
            throw error;
        }
    }
};
//hi new over here
