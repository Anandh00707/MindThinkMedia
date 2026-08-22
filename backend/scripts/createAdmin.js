// ============================================================
// MINDTHINKMEDIA
// ONE-TIME ADMIN ACCOUNT SETUP
// ============================================================

require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("../database/db");

async function createAdmin() {
    try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;

        if (!email || !password) {
            throw new Error(
                "ADMIN_EMAIL and ADMIN_PASSWORD must be present in .env"
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        console.log("Creating admin password hash...");

        const passwordHash = await bcrypt.hash(password, 12);

        const result = await db.query(
            `
            INSERT INTO admin_users (
                email,
                password_hash
            )
            VALUES ($1, $2)
            ON CONFLICT (email)
            DO UPDATE SET
                password_hash = EXCLUDED.password_hash
            RETURNING id, email, created_at;
            `,
            [
                normalizedEmail,
                passwordHash
            ]
        );

        console.log("============================================");
        console.log("Admin account created/updated successfully.");
        console.log("============================================");
        console.log("ID:", result.rows[0].id);
        console.log("Email:", result.rows[0].email);
        console.log("Password hash updated: YES");
        console.log("============================================");

        process.exit(0);

    } catch (error) {

        console.error("============================================");
        console.error("Admin setup failed.");
        console.error("============================================");
        console.error(error.message);

        process.exit(1);
    }
}

createAdmin();