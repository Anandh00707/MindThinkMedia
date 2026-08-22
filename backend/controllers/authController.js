// ============================================================
// MINDTHINKMEDIA
// AUTHENTICATION CONTROLLER
// Node.js + Express + PostgreSQL + bcrypt + JWT
// ============================================================

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../database/db");

// ============================================================
// ADMIN LOGIN
// POST /api/auth/login
// ============================================================

const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        // ----------------------------------------------------
        // Validate input
        // ----------------------------------------------------

        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        // ----------------------------------------------------
        // Validate JWT configuration
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
        // Normalize email
        // ----------------------------------------------------

        const normalizedEmail =
            email.trim().toLowerCase();

        // ----------------------------------------------------
        // Find admin account
        // ----------------------------------------------------

        const result = await db.query(
            `
            SELECT
                id,
                email,
                password_hash
            FROM admin_users
            WHERE LOWER(email) = $1
            LIMIT 1
            `,
            [normalizedEmail]
        );

        // ----------------------------------------------------
        // Do not reveal whether email exists
        // ----------------------------------------------------

        if (result.rows.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const admin = result.rows[0];

        // ----------------------------------------------------
        // Verify password against bcrypt hash
        // ----------------------------------------------------

        const passwordValid =
            await bcrypt.compare(
                password,
                admin.password_hash
            );

        if (!passwordValid) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // ----------------------------------------------------
        // Create JWT
        // ----------------------------------------------------

        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // ----------------------------------------------------
        // Set secure HTTP-only cookie
        // ----------------------------------------------------

        res.cookie(
            "admin_token",
            token,
            {
                httpOnly: true,

                secure:
                    process.env.NODE_ENV === "production",

                sameSite:
                    process.env.NODE_ENV === "production"
                        ? "none"
                        : "lax",

                maxAge:
                    7 * 24 * 60 * 60 * 1000,

                path: "/"
            }
        );

        // ----------------------------------------------------
        // Login successful
        // ----------------------------------------------------

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            admin: {
                id: admin.id,
                email: admin.email
            }
        });

    } catch (error) {

        console.error(
            "Admin login error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Login failed."
        });
    }
};

// ============================================================
// ADMIN LOGOUT
// POST /api/auth/logout
// ============================================================

const logout = (req, res) => {

    res.clearCookie(
        "admin_token",
        {
            httpOnly: true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",

            path: "/"
        }
    );

    return res.status(200).json({
        success: true,
        message: "Logout successful."
    });
};

// ============================================================
// GET CURRENT ADMIN
// GET /api/auth/me
// Protected route
// ============================================================

const getCurrentAdmin = async (req, res) => {

    try {

        // ----------------------------------------------------
        // requireAdmin middleware provides req.admin
        // ----------------------------------------------------

        if (!req.admin || !req.admin.id) {

            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });
        }

        // ----------------------------------------------------
        // Get admin from database
        // ----------------------------------------------------

        const result = await db.query(
            `
            SELECT
                id,
                email,
                created_at
            FROM admin_users
            WHERE id = $1
            LIMIT 1
            `,
            [req.admin.id]
        );

        // ----------------------------------------------------
        // Admin no longer exists
        // ----------------------------------------------------

        if (result.rows.length === 0) {

            return res.status(401).json({
                success: false,
                message: "Admin account not found."
            });
        }

        // ----------------------------------------------------
        // Return admin information
        // ----------------------------------------------------

        return res.status(200).json({
            success: true,
            admin: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Get current admin error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to get admin information."
        });
    }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
    login,
    logout,
    getCurrentAdmin
};