require("dotenv").config();

const db =
    require("./database/db");

async function run() {

    try {

        const result =
            await db.query(`
                SELECT
                    id,
                    title,
                    slug,
                    status,
                    featured_image,
                    image_alt
                FROM articles
                WHERE slug = 'cms-image-test-article'
            `);

        console.table(
            result.rows
        );

    } catch (error) {

        console.error(
            error
        );

    } finally {

        process.exit();
    }
}

run();