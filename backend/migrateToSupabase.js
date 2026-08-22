require("dotenv").config();

const { Pool } = require("pg");


// ========================================
// LOCAL DATABASE
// ========================================

const localDb = new Pool({
    connectionString: process.env.DATABASE_URL
});


// ========================================
// SUPABASE DATABASE
// ========================================

const supabaseDb = new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});


// ========================================
// MIGRATION
// ========================================

async function migrate() {

    try {

        console.log("Starting MindThinkMedia migration...");


        // --------------------------------
        // 1. READ LOCAL ADMIN USERS
        // --------------------------------

        const admins = await localDb.query(`
            SELECT *
            FROM admin_users
            ORDER BY id
        `);

        console.log(
            `Found ${admins.rows.length} admin user(s).`
        );


        // --------------------------------
        // 2. COPY ADMIN USERS
        // --------------------------------

        for (const admin of admins.rows) {

            await supabaseDb.query(
                `
                INSERT INTO admin_users (
                    id,
                    email,
                    password_hash,
                    created_at,
                    updated_at
                )
                VALUES ($1, $2, $3, $4, $5)

                ON CONFLICT (email)
                DO NOTHING
                `,
                [
                    admin.id,
                    admin.email,
                    admin.password_hash,
                    admin.created_at,
                    admin.updated_at
                ]
            );

        }

        console.log("Admin users copied.");


        // --------------------------------
        // 3. READ LOCAL ARTICLES
        // --------------------------------

        const articles = await localDb.query(`
            SELECT *
            FROM articles
            ORDER BY id
        `);

        console.log(
            `Found ${articles.rows.length} article(s).`
        );


        // --------------------------------
        // 4. COPY ARTICLES
        // --------------------------------

        for (const article of articles.rows) {

            await supabaseDb.query(
                `
                INSERT INTO articles (
                    id,
                    title,
                    slug,
                    excerpt,
                    content,
                    category,
                    author,
                    featured_image,
                    image_alt,
                    seo_title,
                    seo_description,
                    status,
                    featured,
                    published_at,
                    created_at,
                    updated_at
                )

                VALUES (
                    $1, $2, $3, $4,
                    $5, $6, $7, $8,
                    $9, $10, $11, $12,
                    $13, $14, $15, $16
                )

                ON CONFLICT (slug)
                DO NOTHING
                `,
                [
                    article.id,
                    article.title,
                    article.slug,
                    article.excerpt,
                    article.content,
                    article.category,
                    article.author,
                    article.featured_image,
                    article.image_alt,
                    article.seo_title,
                    article.seo_description,
                    article.status,
                    article.featured,
                    article.published_at,
                    article.created_at,
                    article.updated_at
                ]
            );

        }

        console.log("Articles copied.");


        // --------------------------------
        // 5. FIX SERIAL ID SEQUENCES
        // --------------------------------

        await supabaseDb.query(`
            SELECT setval(
                pg_get_serial_sequence('admin_users', 'id'),
                COALESCE(
                    (SELECT MAX(id) FROM admin_users),
                    1
                ),
                true
            )
        `);


        await supabaseDb.query(`
            SELECT setval(
                pg_get_serial_sequence('articles', 'id'),
                COALESCE(
                    (SELECT MAX(id) FROM articles),
                    1
                ),
                true
            )
        `);


        console.log("ID sequences updated.");

        console.log("");
        console.log("Migration completed successfully!");


    } catch (error) {

        console.error("");
        console.error("Migration failed:");
        console.error(error);

    } finally {

        await localDb.end();
        await supabaseDb.end();

    }

}


migrate();