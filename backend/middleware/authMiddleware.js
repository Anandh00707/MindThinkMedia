// ============================================================
// MINDTHINKMEDIA
// ADMIN AUTHENTICATION MIDDLEWARE
// JWT + HTTP-ONLY COOKIE
// ============================================================

const jwt = require("jsonwebtoken");

// ============================================================
// REQUIRE ADMIN
// ============================================================

const requireAdmin = (req, res, next) => {

    try {

        // ----------------------------------------------------
        // Make sure JWT secret exists
        // ----------------------------------------------------

        if (!process.env.JWT_SECRET) {

            console.error(
                "JWT_SECRET is missing from environment variables."
            );

            return res.status(500).json({
                success: false,
                message: "Authentication configuration error."
            });
        }

        // ----------------------------------------------------
        // Get token from HTTP-only cookie
        // ----------------------------------------------------

        const token = req.cookies?.admin_token;

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        // ----------------------------------------------------
        // Verify JWT
        // ----------------------------------------------------

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // ----------------------------------------------------
        // Store authenticated admin
        // ----------------------------------------------------

        req.admin = {
            id: decoded.id,
            email: decoded.email
        };

        next();

    } catch (error) {

        console.error(
            "Authentication error:",
            error.name
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication."
        });
    }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    requireAdmin
};