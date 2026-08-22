// ============================================================
// MINDTHINKMEDIA
// AUTHENTICATION RATE LIMITER
// Express Rate Limit
// ============================================================

const rateLimit = require("express-rate-limit");

// ============================================================
// ADMIN LOGIN RATE LIMITER
// ============================================================
//
// Allows a maximum of 10 login attempts from the same client
// within a 15-minute window.
//
// This protects the admin login endpoint from basic
// brute-force password attacks.
//
// ============================================================

const loginRateLimiter = rateLimit({

    // --------------------------------------------------------
    // Time window
    // --------------------------------------------------------

    windowMs: 15 * 60 * 1000,

    // --------------------------------------------------------
    // Maximum requests in the window
    // --------------------------------------------------------

    limit: 10,

    // --------------------------------------------------------
    // Standard rate-limit headers
    // --------------------------------------------------------

    standardHeaders: true,

    // Disable old X-RateLimit-* headers
    legacyHeaders: false,

    // --------------------------------------------------------
    // Response when the limit is reached
    // --------------------------------------------------------

    message: {
        success: false,
        message:
            "Too many login attempts. Please try again later."
    },

    // --------------------------------------------------------
    // Return JSON response
    // --------------------------------------------------------

    handler: (req, res) => {

        return res.status(429).json({
            success: false,
            message:
                "Too many login attempts. Please try again later."
        });
    }

});

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    loginRateLimiter
};