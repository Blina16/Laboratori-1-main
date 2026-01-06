require('dotenv').config();
const DB_CLIENT = (process.env.DB_CLIENT || 'sqlite').toLowerCase();

if (DB_CLIENT === 'mssql') {
    const sql = require('mssql');

    const MSSQL_TRUSTED = (process.env.MSSQL_TRUSTED === 'true');

    // If using Windows Authentication (trusted connection) on Windows
    // install `msnodesqlv8` and set `MSSQL_TRUSTED=true`.
    // For SQL auth set MSSQL_TRUSTED=false and provide MSSQL_USER & MSSQL_PASSWORD.
    let config;
    if (MSSQL_TRUSTED) {
        // Use msnodesqlv8 driver connection string
        // Example server name with instance: DESKTOP-7PVJ96S\\MSSQLSERVER01
        config = {
            server: process.env.MSSQL_SERVER || 'localhost',
            database: process.env.MSSQL_DATABASE || undefined,
            driver: 'msnodesqlv8',
            options: {
                trustedConnection: true
            }
        };
    } else {
        config = {
            user: process.env.MSSQL_USER || undefined,
            password: process.env.MSSQL_PASSWORD || undefined,
            server: process.env.MSSQL_SERVER || 'localhost',
            database: process.env.MSSQL_DATABASE || undefined,
            port: process.env.MSSQL_PORT ? parseInt(process.env.MSSQL_PORT, 10) : 1433,
            options: {
                encrypt: process.env.MSSQL_ENCRYPT === 'true',
                trustServerCertificate: process.env.MSSQL_TRUST_SERVER_CERT === 'true' || true
            }
        };
    }

    const pool = new sql.ConnectionPool(config);
    const poolConnect = pool.connect().then(() => {
        console.log('✅ Connected to phpmyadmin database');
    }).catch(err => {
        console.error('MSSQL connection error:', err);
        throw err;
    });

    // Helper: replace positional `?` with named parameters @p0, @p1, ...
    function prepareSqlWithParams(rawSql, params = [], request) {
        if (!params || params.length === 0) return rawSql;
        let idx = 0;
        const sqlWithNames = rawSql.replace(/\?/g, () => `@p${idx++}`);
        params.forEach((p, i) => request.input(`p${i}`, p));
        return sqlWithNames;
    }

    module.exports = {
        query: async (rawSql, params = []) => {
            await poolConnect;
            try {
                const request = pool.request();
                const sqlToRun = prepareSqlWithParams(rawSql, params, request);
                const result = await request.query(sqlToRun);
                return result.recordset || result.rowsAffected;
            } catch (error) {
                console.error('MSSQL query error:', error);
                throw error;
            }
        },
        transaction: async (queries = []) => {
            await poolConnect;
            const transaction = new sql.Transaction(pool);
            try {
                await transaction.begin();
                const trRequest = transaction.request();
                const results = [];
                for (const { sql: q, params = [] } of queries) {
                    let idx = 0;
                    const sqlWithNames = q.replace(/\?/g, () => `@p${idx++}`);
                    params.forEach((p, i) => trRequest.input(`p${i}`, p));
                    const res = await trRequest.query(sqlWithNames);
                    results.push(res.recordset || res.rowsAffected);
                }
                await transaction.commit();
                return results;
            } catch (err) {
                await transaction.rollback();
                console.error('MSSQL transaction error:', err);
                throw err;
            }
        }
    };

} else {
    const Database = require('better-sqlite3');
    const path = require('path');

    const dbPath = path.join(__dirname, 'database.sqlite');
    const db = new Database(dbPath);

    // Test the connection
    db.prepare('SELECT 1').get();
    console.log('✅ Connected to SQLite database');

    // Create tables if they don't exist (keeps previous behavior)
   

    db.exec(createTables);
    
    // Seed about_us if empty
    const aboutUsCount = db.prepare('SELECT count(*) as count FROM about_us').get();
    if (aboutUsCount.count === 0) {
        db.prepare('INSERT INTO about_us (description) VALUES (?)').run('Welcome to our tutoring platform!');
    }

    // Migration: Add file_path to assignments if it doesn't exist
    const assignmentsColumns = db.prepare("PRAGMA table_info(assignments)").all();
    const hasFilePath = assignmentsColumns.some(col => col.name === 'file_path');
    if (!hasFilePath) {
        console.log('Migrating: Adding file_path column to assignments table...');
        db.prepare("ALTER TABLE assignments ADD COLUMN file_path TEXT").run();
    }

    console.log('✅ Database tables ready');

    // Quick migration: ensure tutors table has expected columns (first_name, last_name, description, rate)
    try {
        const cols = db.prepare("PRAGMA table_info(tutors);").all();
        const colNames = cols.map(c => c.name);
        const missing = [];
        if (!colNames.includes('first_name')) missing.push("first_name TEXT");
        if (!colNames.includes('last_name')) missing.push("last_name TEXT");
        if (!colNames.includes('description')) missing.push("description TEXT");
        if (!colNames.includes('rate')) missing.push("rate REAL DEFAULT 0");
        if (missing.length) {
            console.log('ℹ️ Migrating tutors table, adding columns:', missing.join(', '));
            for (const colDef of missing) {
                try {
                    db.prepare(`ALTER TABLE tutors ADD COLUMN ${colDef}`).run();
                } catch (e) {
                    // ignore if cannot add
                }
            }
            // If there is an existing `name` column, copy it to `first_name`
            if (colNames.includes('name')) {
                try {
                    db.prepare("UPDATE tutors SET first_name = name WHERE first_name IS NULL OR first_name = '';").run();
                } catch (e) {}
            }
        }
    } catch (e) {
        console.error('Migration check for tutors failed:', e && e.message);
    }

    // Quick migration: ensure users table has expected columns (email, name)
    try {
        const cols = db.prepare("PRAGMA table_info(users);").all();
        const colNames = cols.map(c => c.name);
        const missing = [];
        if (!colNames.includes('email')) missing.push("email TEXT UNIQUE");
        if (!colNames.includes('name')) missing.push("name TEXT");
        
        if (missing.length) {
            console.log('ℹ️ Migrating users table, adding columns:', missing.join(', '));
            for (const colDef of missing) {
                try {
                    // Note: SQLite might complain about adding UNIQUE constraint with default NULL values if table not empty.
                    // But for now let's try. If it fails, we catch it.
                    db.prepare(`ALTER TABLE users ADD COLUMN ${colDef}`).run();
                } catch (e) {
                     console.error(`Failed to add column ${colDef} to users:`, e.message);
                     // Fallback: try adding without UNIQUE if that was the issue
                     if (colDef.includes('UNIQUE')) {
                         try {
                             const simpleDef = colDef.replace('UNIQUE', '');
                             db.prepare(`ALTER TABLE users ADD COLUMN ${simpleDef}`).run();
                         } catch (e2) {}
                     }
                }
            }
        }
    } catch (e) {
        console.error('Migration check for users failed:', e && e.message);
    }

    module.exports = {
        query: (sql, params = []) => {
            try {
                const stmt = db.prepare(sql);
                if (sql.trim().toLowerCase().startsWith('select')) {
                    return params.length ? stmt.all(params) : stmt.all();
                }
                const result = params.length ? stmt.run(params) : stmt.run();
                // Map lastInsertRowid to insertId for MySQL compatibility
                return { ...result, insertId: result.lastInsertRowid };
            } catch (error) {
                console.error('Database error:', error);
                throw error;
            }
        },
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
}
