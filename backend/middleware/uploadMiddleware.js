// ============================================================
// MINDTHINKMEDIA
// IMAGE UPLOAD MIDDLEWARE
// ============================================================

const multer =
    require("multer");


// ============================================================
// STORAGE
//
// Images are kept temporarily in memory.
// The controller sends this buffer to Cloudinary.
//
// Nothing is written to backend/uploads.
// ============================================================

const storage =
    multer.memoryStorage();


// ============================================================
// FILE VALIDATION
// ============================================================

const fileFilter = (
    req,
    file,
    cb
) => {

    const allowedMimeTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (
        !allowedMimeTypes.includes(
            file.mimetype
        )
    ) {

        return cb(
            new Error(
                "Only JPG, PNG and WebP images are allowed."
            ),
            false
        );
    }


    cb(
        null,
        true
    );
};


// ============================================================
// MULTER
// ============================================================

const uploadArticleImage =
    multer({

        storage,

        fileFilter,

        limits: {

            // 5 MB
            fileSize:
                5 * 1024 * 1024
        }

    });


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    uploadArticleImage
};