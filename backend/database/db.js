// ============================================================
// MINDTHINKMEDIA
// DATABASE CONNECTION
// PostgreSQL + Node.js
// ============================================================

const { Pool } = require("pg");


// ============================================================
// DATABASE POOL
// ============================================================

const pool = new Pool({

    connectionString:
        process.env.DATABASE_URL,

    // Keep the pool small for the deployed application.
    max:
        5,

    // Close unused connections after 30 seconds.
    idleTimeoutMillis:
        30000,

    // Give hosted PostgreSQL more time to establish
    // a new connection.
    connectionTimeoutMillis:
        15000

});


// ============================================================
// POOL ERROR HANDLER
// ============================================================
//
// PostgreSQL connections can occasionally be terminated
// while sitting idle.
//
// Logging the error prevents these events from being silent
// and gives us useful information in Render logs.
// ============================================================

pool.on(
    "error",
    (error) => {

        console.error(
            "Unexpected PostgreSQL pool error:",
            error
        );

    }
);


// ============================================================
// QUERY HELPER
// ============================================================

const query = (
    text,
    params
) => {

    return pool.query(
        text,
        params
    );

};


// ============================================================
// TEST DATABASE CONNECTION
// ============================================================

async function testDatabaseConnection() {

    const result =
        await pool.query(
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