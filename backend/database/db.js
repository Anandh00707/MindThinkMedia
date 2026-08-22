// ============================================================
// MINDTHINKMEDIA
// DATABASE CONNECTION
// PostgreSQL + Node.js
// ============================================================

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    // PostgreSQL connection settings
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
});

// ============================================================
// QUERY HELPER
// ============================================================

const query = (text, params) => {
    return pool.query(text, params);
};

// ============================================================
// TEST DATABASE CONNECTION
// ============================================================

async function testDatabaseConnection() {

    const result = await pool.query(
        "SELECT NOW() AS time"
    );

    console.log(
        "PostgreSQL connected successfully."
    );

    console.log(
        "Database time:",
        result.rows[0].time
    );
}

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    pool,
    query,
    testDatabaseConnection
};