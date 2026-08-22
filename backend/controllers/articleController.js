// ============================================================
// MINDTHINKMEDIA
// ARTICLE CONTROLLER
// PostgreSQL + Express
// ============================================================

const db = require("../database/db");


// ============================================================
// GET PUBLISHED ARTICLES
// PUBLIC
// GET /api/articles
// ============================================================
//
// Public visitors can ONLY see published articles.
//
// Draft articles must NEVER appear here.
// ============================================================

const getAllArticles = async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
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
            FROM articles
            WHERE status = 'published'
            ORDER BY published_at DESC NULLS LAST
        `);


        return res.status(200).json({

            success: true,

            count: result.rows.length,

            articles: result.rows

        });

    } catch (error) {

        console.error(
            "Get published articles error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to fetch articles."

        });

    }

};


// ============================================================
// GET ALL ARTICLES FOR ADMIN
// ADMIN ONLY
// GET /api/articles/admin
// ============================================================
//
// Admin can see:
//
// - Draft
// - Published
//
// This is what the dashboard will use.
// ============================================================

const getAdminArticles = async (req, res) => {

    try {

        const result = await db.query(`
            SELECT
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
            FROM articles
            ORDER BY created_at DESC
        `);


        return res.status(200).json({

            success: true,

            count: result.rows.length,

            articles: result.rows

        });

    } catch (error) {

        console.error(
            "Get admin articles error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to fetch admin articles."

        });

    }

};


// ============================================================
// GET ONE PUBLISHED ARTICLE
// PUBLIC
// GET /api/articles/:id
// ============================================================
//
// Public users cannot request a draft article by ID.
// ============================================================

const getArticleById = async (req, res) => {

    try {

        const { id } = req.params;


        const result = await db.query(
            `
            SELECT
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
            FROM articles
            WHERE id = $1
            AND status = 'published'
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Article not found."

            });

        }


        return res.status(200).json({

            success: true,

            article: result.rows[0]

        });

    } catch (error) {

        console.error(
            "Get public article error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to fetch article."

        });

    }

};


// ============================================================
// GET ONE ARTICLE FOR ADMIN
// ADMIN ONLY
// GET /api/articles/admin/:id
// ============================================================
//
// Admin can view both draft and published articles.
// ============================================================

const getAdminArticleById = async (req, res) => {

    try {

        const { id } = req.params;


        const result = await db.query(
            `
            SELECT
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
            FROM articles
            WHERE id = $1
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Article not found."

            });

        }


        return res.status(200).json({

            success: true,

            article: result.rows[0]

        });

    } catch (error) {

        console.error(
            "Get admin article error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to fetch article."

        });

    }

};


// ============================================================
// CREATE ARTICLE
// ADMIN ONLY
// POST /api/articles
// ============================================================

const createArticle = async (req, res) => {

    try {

        const {

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
            featured

        } = req.body;


        // ----------------------------------------------------
        // Required fields
        // ----------------------------------------------------

        if (
            typeof title !== "string" ||
            !title.trim() ||

            typeof slug !== "string" ||
            !slug.trim() ||

            typeof excerpt !== "string" ||
            !excerpt.trim() ||

            typeof content !== "string" ||
            !content.trim() ||

            typeof category !== "string" ||
            !category.trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Title, slug, excerpt, content and category are required."

            });

        }


        // ----------------------------------------------------
        // Normalize slug
        // ----------------------------------------------------

        const cleanSlug = slug
            .trim()
            .toLowerCase();


        // ----------------------------------------------------
        // Check duplicate slug
        // ----------------------------------------------------

        const existingArticle = await db.query(
            `
            SELECT id
            FROM articles
            WHERE slug = $1
            LIMIT 1
            `,
            [cleanSlug]
        );


        if (existingArticle.rows.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "An article with this slug already exists."

            });

        }


        // ----------------------------------------------------
        // Determine status
        // ----------------------------------------------------

        const articleStatus =
            status === "published"
                ? "published"
                : "draft";


        const publishedAt =
            articleStatus === "published"
                ? new Date()
                : null;


        // ----------------------------------------------------
        // Insert article
        // ----------------------------------------------------

        const result = await db.query(
            `
            INSERT INTO articles (

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
                published_at

            )

            VALUES (

                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                $12,
                $13

            )

            RETURNING *
            `,
            [

                title.trim(),

                cleanSlug,

                excerpt.trim(),

                content,

                category.trim(),

                author?.trim() || "MindThinkMedia",

                featured_image || null,

                image_alt || null,

                seo_title?.trim() || title.trim(),

                seo_description?.trim() || excerpt.trim(),

                articleStatus,

                featured === true,

                publishedAt

            ]
        );


        return res.status(201).json({

            success: true,

            message: "Article created successfully.",

            article: result.rows[0]

        });

    } catch (error) {

        console.error(
            "Create article error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to create article."

        });

    }

};


// ============================================================
// UPDATE ARTICLE
// ADMIN ONLY
// PUT /api/articles/:id
// ============================================================

const updateArticle = async (req, res) => {

    try {

        const { id } = req.params;


        const {

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
            featured

        } = req.body;


        // ----------------------------------------------------
        // Find existing article
        // ----------------------------------------------------

        const existingArticle = await db.query(
            `
            SELECT *
            FROM articles
            WHERE id = $1
            `,
            [id]
        );


        if (existingArticle.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Article not found."

            });

        }


        const oldArticle =
            existingArticle.rows[0];


        // ----------------------------------------------------
        // Slug
        // ----------------------------------------------------

        const newSlug =
            slug !== undefined
                ? slug.trim().toLowerCase()
                : oldArticle.slug;


        // ----------------------------------------------------
        // Check duplicate slug
        // ----------------------------------------------------

        const slugCheck = await db.query(
            `
            SELECT id
            FROM articles
            WHERE slug = $1
            AND id != $2
            LIMIT 1
            `,
            [newSlug, id]
        );


        if (slugCheck.rows.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Another article already uses this slug."

            });

        }


        // ----------------------------------------------------
        // New values
        // ----------------------------------------------------

        const newTitle =
            title !== undefined
                ? title.trim()
                : oldArticle.title;


        const newExcerpt =
            excerpt !== undefined
                ? excerpt.trim()
                : oldArticle.excerpt;


        const newContent =
            content !== undefined
                ? content
                : oldArticle.content;


        const newCategory =
            category !== undefined
                ? category.trim()
                : oldArticle.category;


        const newAuthor =
            author !== undefined
                ? author.trim()
                : oldArticle.author;


        const newImage =
            featured_image !== undefined
                ? featured_image
                : oldArticle.featured_image;


        const newImageAlt =
            image_alt !== undefined
                ? image_alt
                : oldArticle.image_alt;


        const newSeoTitle =
            seo_title !== undefined
                ? seo_title.trim()
                : oldArticle.seo_title;


        const newSeoDescription =
            seo_description !== undefined
                ? seo_description.trim()
                : oldArticle.seo_description;


        const newStatus =
            status === "published" ||
            status === "draft"
                ? status
                : oldArticle.status;


        const newFeatured =
            typeof featured === "boolean"
                ? featured
                : oldArticle.featured;


        // ----------------------------------------------------
        // Publishing date
        // ----------------------------------------------------

        let newPublishedAt =
            oldArticle.published_at;


        if (
            newStatus === "published" &&
            oldArticle.status !== "published"
        ) {

            newPublishedAt = new Date();

        }


        if (newStatus === "draft") {

            newPublishedAt = null;

        }


        // ----------------------------------------------------
        // Update database
        // ----------------------------------------------------

        const result = await db.query(
            `
            UPDATE articles

            SET

                title = $1,
                slug = $2,
                excerpt = $3,
                content = $4,
                category = $5,
                author = $6,
                featured_image = $7,
                image_alt = $8,
                seo_title = $9,
                seo_description = $10,
                status = $11,
                featured = $12,
                published_at = $13,
                updated_at = CURRENT_TIMESTAMP

            WHERE id = $14

            RETURNING *
            `,
            [

                newTitle,
                newSlug,
                newExcerpt,
                newContent,
                newCategory,
                newAuthor,
                newImage,
                newImageAlt,
                newSeoTitle,
                newSeoDescription,
                newStatus,
                newFeatured,
                newPublishedAt,
                id

            ]
        );


        return res.status(200).json({

            success: true,

            message: "Article updated successfully.",

            article: result.rows[0]

        });

    } catch (error) {

        console.error(
            "Update article error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to update article."

        });

    }

};


// ============================================================
// DELETE ARTICLE
// ADMIN ONLY
// DELETE /api/articles/:id
// ============================================================

const deleteArticle = async (req, res) => {

    try {

        const { id } = req.params;


        const result = await db.query(
            `
            DELETE FROM articles

            WHERE id = $1

            RETURNING id, title, slug
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Article not found."

            });

        }


        return res.status(200).json({

            success: true,

            message: "Article deleted successfully.",

            article: result.rows[0]

        });

    } catch (error) {

        console.error(
            "Delete article error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to delete article."

        });

    }

};


// ============================================================
// PUBLISH ARTICLE
// ADMIN ONLY
// PATCH /api/articles/:id/publish
// ============================================================

const publishArticle = async (req, res) => {

    try {

        const { id } = req.params;


        const result = await db.query(
            `
            UPDATE articles

            SET

                status = 'published',

                published_at = COALESCE(
                    published_at,
                    CURRENT_TIMESTAMP
                ),

                updated_at = CURRENT_TIMESTAMP

            WHERE id = $1

            RETURNING *
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Article not found."

            });

        }


        return res.status(200).json({

            success: true,

            message: "Article published successfully.",

            article: result.rows[0]

        });

    } catch (error) {

        console.error(
            "Publish article error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to publish article."

        });

    }

};


// ============================================================
// UNPUBLISH ARTICLE
// ADMIN ONLY
// PATCH /api/articles/:id/unpublish
// ============================================================

const unpublishArticle = async (req, res) => {

    try {

        const { id } = req.params;


        const result = await db.query(
            `
            UPDATE articles

            SET

                status = 'draft',

                published_at = NULL,

                updated_at = CURRENT_TIMESTAMP

            WHERE id = $1

            RETURNING *
            `,
            [id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({

                success: false,

                message: "Article not found."

            });

        }


        return res.status(200).json({

            success: true,

            message: "Article moved back to draft.",

            article: result.rows[0]

        });

    } catch (error) {

        console.error(
            "Unpublish article error:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to unpublish article."

        });

    }

};

// ============================================================
// GET ONE PUBLISHED ARTICLE BY SLUG
// PUBLIC
// GET /api/articles/slug/:slug
// ============================================================
//
// Public users can only access published articles.
// Draft articles are never returned.
// ============================================================

const getArticleBySlug = async (req, res) => {

    try {

        const { slug } = req.params;

        if (
            typeof slug !== "string" ||
            !slug.trim()
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid article slug."
            });

        }

        const cleanSlug =
            slug.trim().toLowerCase();


        const result = await db.query(
            `
            SELECT
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
            FROM articles
            WHERE slug = $1
            AND status = 'published'
            LIMIT 1
            `,
            [cleanSlug]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Article not found."
            });

        }


        return res.status(200).json({
            success: true,
            article: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Get article by slug error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch article."
        });

    }

};


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    getAllArticles,

    getAdminArticles,

    getArticleById,

    getArticleBySlug,

    getAdminArticleById,

    createArticle,

    updateArticle,

    deleteArticle,

    publishArticle,

    unpublishArticle

};