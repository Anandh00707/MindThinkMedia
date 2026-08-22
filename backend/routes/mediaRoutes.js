// ============================================================
// MINDTHINKMEDIA
// MEDIA ROUTES
// ============================================================

const express = require("express");


const {
    requireAdmin
} = require("../middleware/authMiddleware");


const {
    uploadArticleImage
} = require("../middleware/uploadMiddleware");


const {
    uploadArticleImage: uploadArticleImageController
} = require("../controllers/mediaController");


const router =
    express.Router();


// ============================================================
// UPLOAD ARTICLE IMAGE
// POST /api/media/upload
// ADMIN ONLY
// ============================================================

router.post(
    "/upload",

    requireAdmin,

    uploadArticleImage.single(
        "image"
    ),

    uploadArticleImageController
);


// ============================================================
// EXPORT
// ============================================================

module.exports = router;