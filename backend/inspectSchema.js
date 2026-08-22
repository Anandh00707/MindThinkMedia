require("dotenv").config();

const { Pool } = require("pg");


const db = new Pool({
    connectionString: process.env.DATABASE_URL
});


async function inspectSchema() {

    try {

        const result = await db.query(`
            SELECT
                table_name,
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name IN (
                  'admin_users',
                  'articles'
              )
            ORDER BY
                table_name,
                ordinal_position;
        `);


        console.table(result.rows);


    } catch (error) {

        console.error(
            "Schema inspection failed:"
        );

        console.error(error);


    } finally {

        await db.end();

    }

}


inspectSchema();