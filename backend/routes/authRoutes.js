// ============================================================
// MINDTHINKMEDIA
// AUTHENTICATION ROUTES
// ============================================================

const express = require("express");

const {
    login,
    logout,
    getCurrentAdmin
} = require("../controllers/authController");

const {
    requireAdmin
} = require("../middleware/authMiddleware");

const {
    loginRateLimiter
} = require("../middleware/rateLimitMiddleware");

const router = express.Router();

// ============================================================
// ADMIN LOGIN
// POST /api/auth/login
// ============================================================

router.post(
    "/login",
    loginRateLimiter,
    login
);

// ============================================================
// ADMIN LOGOUT
// POST /api/auth/logout
// ============================================================

router.post(
    "/logout",
    requireAdmin,
    logout
);

// ============================================================
// GET CURRENT ADMIN
// GET /api/auth/me
// ============================================================

router.get(
    "/me",
    requireAdmin,
    getCurrentAdmin
);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;