// ============================================================
// MINDTHINKMEDIA
// ARTICLE ROUTES
// ============================================================

const express = require("express");

const {
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
} = require("../controllers/articleController");

const {
    requireAdmin
} = require("../middleware/authMiddleware");

const router = express.Router();


// ============================================================
// ADMIN ARTICLE ROUTES
// ============================================================

// Get all articles for dashboard
// Includes drafts + published
router.get(
    "/admin",
    requireAdmin,
    getAdminArticles
);


// Get one article for dashboard
// Includes drafts + published
router.get(
    "/admin/:id",
    requireAdmin,
    getAdminArticleById
);


// ============================================================
// PUBLIC ARTICLE ROUTES
// ============================================================
// Get published articles
router.get(
    "/",
    getAllArticles
);

router.get(
    "/slug/:slug",
    getArticleBySlug
);

// Get one published article
router.get(
    "/:id",
    getArticleById
);


// ============================================================
// ADMIN CREATE / UPDATE / DELETE / PUBLISH
// ============================================================

// Create article
router.post(
    "/",
    requireAdmin,
    createArticle
);


// Update article
router.put(
    "/:id",
    requireAdmin,
    updateArticle
);


// Delete article
router.delete(
    "/:id",
    requireAdmin,
    deleteArticle
);


// Publish article
router.patch(
    "/:id/publish",
    requireAdmin,
    publishArticle
);


// Unpublish article
router.patch(
    "/:id/unpublish",
    requireAdmin,
    unpublishArticle
);


// ============================================================
// EXPORT
// ============================================================

module.exports = router;