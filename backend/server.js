// ============================================================
// MINDTHINKMEDIA
// BACKEND SERVER
// Node.js + Express + PostgreSQL
// ============================================================

require("dotenv").config();
const path = require("path");

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const {
    testDatabaseConnection
} = require("./database/db");

const articleRoutes = require("./routes/articleRoutes");
const authRoutes = require("./routes/authRoutes");
const mediaRoutes = require("./routes/mediaRoutes");

// ============================================================
// ENVIRONMENT VALIDATION
// ============================================================

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is missing.");
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing.");
    process.exit(1);
}

// ============================================================
// EXPRESS APP
// ============================================================

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

// ============================================================
// SECURITY HEADERS
// ============================================================

app.use(
    helmet()
);

// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "https://mindthinkmedia.netlify.app"
];

app.use(cors({
    origin: (origin, callback) => {

        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(
            new Error("Not allowed by CORS")
        );
    },

    credentials: true
}));

//========================================================= 
// BODY PARSERS
//============================================================

app.use(
    express.json({
        limit: "2mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "2mb"
    })
);

// ============================================================
// COOKIE PARSER
// ============================================================

app.use(
    cookieParser()
);

// ============================================================
// PUBLIC UPLOADS
// Allow frontend on port 5500 to display uploaded images
// ============================================================

app.use(
    "/uploads",

    (req, res, next) => {

        res.setHeader(
            "Cross-Origin-Resource-Policy",
            "cross-origin"
        );

        next();
    },

    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
    "/api/health",
    (req, res) => {

        res.status(200).json({
            success: true,
            message: "MindThinkMedia API is running.",
            status: "healthy"
        });

    }
);

// ============================================================
// AUTH ROUTES
// ============================================================

app.use(
    "/api/auth",
    authRoutes
);

// ============================================================
// ARTICLE ROUTES
// ============================================================

app.use(
    "/api/articles",
    articleRoutes
);

// ============================================================
// MEDIA ROUTES
// ============================================================

app.use(
    "/api/media",
    mediaRoutes
);

// ============================================================
// API 404 HANDLER
// ============================================================

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({
            success: false,
            message: "API endpoint not found."
        });

    }
);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "Server Error:",
            err
        );


        if (
            err.code === "LIMIT_FILE_SIZE"
        ) {

            return res.status(400).json({
                success: false,
                message: "Image is too large. Maximum size is 5 MB."
            });

        }


        if (
            err.message ===
            "Only JPG, PNG and WebP images are allowed."
        ) {

            return res.status(400).json({
                success: false,
                message: err.message
            });

        }


        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
);

// ============================================================
// START SERVER
// ============================================================

async function startServer() {

    try {

        await testDatabaseConnection();

        app.listen(
            PORT,
            () => {

                console.log(
                    "============================================"
                );

                console.log(
                    "      MindThinkMedia Backend Server"
                );

                console.log(
                    "============================================"
                );

                console.log(
                    `Server: http://localhost:${PORT}`
                );

                console.log(
                    `Health: http://localhost:${PORT}/api/health`
                );

                console.log(
                    `Articles: http://localhost:${PORT}/api/articles`
                );

                console.log(
                    "Database: PostgreSQL connected"
                );

                console.log(
                    "Status: Running"
                );

                console.log(
                    "============================================"
                );

            }
        );

    } catch (error) {

        console.error(
            "============================================"
        );

        console.error(
            "PostgreSQL connection failed."
        );

        console.error(
            "============================================"
        );

        console.error(
            error.message
        );

        process.exit(1);
    }
}

startServer();