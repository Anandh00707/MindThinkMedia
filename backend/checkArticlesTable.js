require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkTable() {
    try {

        const result = await pool.query(`
            SELECT
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_name = 'articles'
            ORDER BY ordinal_position
        `);

        console.table(result.rows);

    } catch (error) {

        console.error("Database error:");
        console.error(error);

    } finally {

        await pool.end();

    }
}

checkTable();