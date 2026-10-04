/**
 * event_db.js
 * PROG2002 Assignment 2 - Database connection module
 * Author: Boyu Liu (24832407)
 *
 * Creates a reusable MySQL connection pool for the charityevents_db database.
 * Every API route imports this module to query the database.
 *
 * Database credentials are kept out of the repository. Create a file named
 * "db-config.js" in this folder with your own MySQL details, for example:
 *
 *     module.exports = {
 *         host: 'localhost',
 *         user: 'root',
 *         password: 'your_password',
 *         database: 'charityevents_db'
 *     };
 *
 * db-config.js is listed in .gitignore so the password is never committed.
 * If that file does not exist, the placeholder settings below are used.
 */

const mysql = require('mysql2/promise');

// ---------------------------------------------------------------------------
// Database configuration
// ---------------------------------------------------------------------------
const defaultConfig = {
    host: 'localhost',            // MySQL server host
    port: 3306,                   // MySQL server port
    user: 'root',                 // MySQL username
    password: 'your_password',    // <-- change this to your MySQL password
    database: 'charityevents_db', // Database created from charityevents_db.sql
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let localConfig = {};
try {
    // Optional local settings file (not tracked by git)
    localConfig = require('./db-config.js');
} catch (err) {
    // No local file - fall back to the placeholder configuration above
}

const dbConfig = Object.assign({}, defaultConfig, localConfig);

// A connection pool manages connections efficiently so that several
// API requests can be served without opening a new connection each time.
const pool = mysql.createPool(dbConfig);

/**
 * Helper function that runs a SQL query using the pool.
 * @param {string} sql      - The SQL statement (use ? placeholders for values)
 * @param {Array}  params   - Values bound to the placeholders (safe from SQL injection)
 * @returns {Promise<Array>} The resulting rows
 */
async function query(sql, params) {
    const [rows] = await pool.execute(sql, params || []);
    return rows;
}

module.exports = { pool, query };
