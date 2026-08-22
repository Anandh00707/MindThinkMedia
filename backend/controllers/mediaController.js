// ============================================================
// MINDTHINKMEDIA
// MEDIA CONTROLLER
// ============================================================

const { v2: cloudinary } =
    require("cloudinary");


// ============================================================
// CLOUDINARY CONFIGURATION
// ============================================================

cloudinary.config({

    cloud_name:
        process.env.CLOUDINARY_CLOUD_NAME,

    api_key:
        process.env.CLOUDINARY_API_KEY,

    api_secret:
        process.env.CLOUDINARY_API_SECRET,

    secure:
        true
});


// ============================================================
// UPLOAD BUFFER TO CLOUDINARY
// ============================================================

function uploadBufferToCloudinary(
    buffer
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const uploadStream =
                cloudinary.uploader.upload_stream(

                    {
                        folder:
                            "mindthinkmedia/articles",

                        resource_type:
                            "image"
                    },

                    (
                        error,
                        result
                    ) => {

                        if (error) {

                            reject(error);

                            return;
                        }


                        resolve(result);
                    }
                );


            uploadStream.end(
                buffer
            );
        }
    );
}


// ============================================================
// UPLOAD ARTICLE IMAGE
// POST /api/media/upload
// ============================================================

const uploadArticleImage =
    async (
        req,
        res
    ) => {

        try {

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please select an image to upload."
                });
            }


            if (
                !req.file.buffer
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Uploaded image data is missing."
                });
            }


            const result =
                await uploadBufferToCloudinary(
                    req.file.buffer
                );


            return res.status(201).json({

                success:
                    true,

                message:
                    "Image uploaded successfully.",

                image: {

                    filename:
                        result.public_id,

                    url:
                        result.secure_url,

                    publicId:
                        result.public_id,

                    width:
                        result.width,

                    height:
                        result.height,

                    format:
                        result.format,

                    mimetype:
                        req.file.mimetype,

                    size:
                        req.file.size
                }
            });


        } catch (error) {

            console.error(
                "Cloudinary image upload error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Failed to upload image."

            });
        }
    };


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    uploadArticleImage
};