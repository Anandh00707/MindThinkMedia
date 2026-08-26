// ============================================================
// MINDTHINKMEDIA
// DATABASE CONNECTION
// PostgreSQL + Node.js
// ============================================================




// ============================================================
// DATABASE POOL
// ============================================================

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,

    max: 5,

    idleTimeoutMillis: 10000,

    connectionTimeoutMillis: 20000,

    keepAlive: true,

    keepAliveInitialDelayMillis: 10000,

    allowExitOnIdle: false
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