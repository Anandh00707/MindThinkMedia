/* =========================================================
   MINDTHINKMEDIA
   ARTICLE EDITOR

   SUPPORTS
   ---------------------------------------------------------
   • Admin authentication
   • Create article
   • Load existing article
   • Edit existing article
   • Save as draft
   • Publish article
   • Auto-generate slug
   • SEO title helper
   • SEO description character count
   • Basic HTML editor toolbar
   • Article information
   • Featured image upload
   • Featured image preview
   • Replace featured image
   • Remove featured image from article
   • Image validation
   • Success / error messages

   NOT YET INCLUDED
   ---------------------------------------------------------
   • Physical deletion of unused image files
   • Preview mode
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const API_BASE_URL =
    "https://mindthinkmedia.onrender.com/api";


const ARTICLE_API_URL =
    `${API_BASE_URL}/articles`;


const MEDIA_UPLOAD_URL =
    `${API_BASE_URL}/media/upload`;


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /* =====================================================
           ELEMENTS
        ===================================================== */

        const articleForm =
            document.getElementById(
                "articleForm"
            );


        const titleInput =
            document.getElementById(
                "articleTitle"
            );


        const slugInput =
            document.getElementById(
                "articleSlug"
            );


        const categoryInput =
            document.getElementById(
                "articleCategory"
            );


        const authorInput =
            document.getElementById(
                "articleAuthor"
            );


        const excerptInput =
            document.getElementById(
                "articleExcerpt"
            );


        const contentInput =
            document.getElementById(
                "articleContent"
            );


        const seoTitleInput =
            document.getElementById(
                "seoTitle"
            );


        const seoDescriptionInput =
            document.getElementById(
                "seoDescription"
            );


        const seoDescriptionCount =
            document.getElementById(
                "seoDescriptionCount"
            );


        const featuredCheckbox =
            document.getElementById(
                "articleFeatured"
            );


        const featuredImageInput =
            document.getElementById(
                "featuredImageInput"
            );


        const featuredImageUrl =
            document.getElementById(
                "featuredImageUrl"
            );


        const imagePreview =
            document.getElementById(
                "imagePreview"
            );


        const imagePreviewElement =
            document.getElementById(
                "imagePreviewElement"
            );


        const removeImageButton =
            document.getElementById(
                "removeImageButton"
            );


        const imageAltInput =
            document.getElementById(
                "imageAlt"
            );


        const statusInput =
            document.getElementById(
                "articleStatus"
            );


        const currentStatus =
            document.getElementById(
                "currentStatus"
            );


        const saveDraftButton =
            document.getElementById(
                "saveDraftButton"
            );


        const publishButton =
            document.getElementById(
                "publishButton"
            );


        const generateSlugButton =
            document.getElementById(
                "generateSlugButton"
            );


        const editorMessage =
            document.getElementById(
                "editorMessage"
            );


        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        const previewButton =
            document.getElementById(
                "previewButton"
            );


        /* =====================================================
           INTERNAL STATE
        ===================================================== */

        let imageUploadInProgress =
            false;


        /*
            This becomes true when an existing image
            is removed from the editor.

            With the current backend update controller,
            an empty string is needed to replace the
            existing value.

            We can normalize this to NULL in PostgreSQL
            when we improve the backend media cleanup.
        */

        let imageWasRemoved =
            false;


        /* =====================================================
           AUTHENTICATION
        ===================================================== */

        const authenticated =
            await verifyAdminSession();


        if (!authenticated) {

            window.location.href =
                "./login.html";

            return;
        }


        /* =====================================================
           DETERMINE CREATE / EDIT MODE
        ===================================================== */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const articleId =
            params.get("id");


        let currentArticleId =
            articleId || null;


        let currentArticle =
            null;


        /* =====================================================
           INITIAL SLUG TRACKING
        ===================================================== */

        let slugWasManuallyEdited =
            false;


        /* =====================================================
           EDIT MODE
        ===================================================== */

        if (currentArticleId) {

            try {

                currentArticle =
                    await loadAdminArticle(
                        currentArticleId
                    );


                populateEditorForm(
                    currentArticle,
                    {
                        titleInput,
                        slugInput,
                        categoryInput,
                        authorInput,
                        excerptInput,
                        contentInput,
                        seoTitleInput,
                        seoDescriptionInput,
                        featuredCheckbox,
                        featuredImageUrl,
                        imageAltInput,
                        statusInput,
                        currentStatus
                    }
                );


                updateEditModeUI(
                    currentArticle
                );


                updateSeoDescriptionCount(
                    seoDescriptionInput,
                    seoDescriptionCount
                );


                /* =============================================
                   EXISTING IMAGE PREVIEW
                ============================================= */

                updateImagePreview(
                    currentArticle.featured_image || "",
                    imagePreview,
                    imagePreviewElement,
                    removeImageButton,
                    currentArticle.image_alt ||
                    currentArticle.title ||
                    "Featured image"
                );


                /*
                    Do not automatically change an existing
                    article's slug when its title changes.
                */

                slugWasManuallyEdited =
                    true;


            } catch (error) {

                console.error(
                    "Failed to load article:",
                    error
                );


                showMessage(
                    editorMessage,
                    error.message ||
                    "Unable to load this article.",
                    "error"
                );


                return;
            }


        } else {

            /* =================================================
               CREATE MODE
            ================================================= */

            setStatus(
                "draft",
                statusInput,
                currentStatus
            );


            updateImagePreview(
                "",
                imagePreview,
                imagePreviewElement,
                removeImageButton
            );
        }


        /* =====================================================
           AUTO SLUG FROM TITLE
        ===================================================== */

        if (slugInput) {

            slugInput.addEventListener(
                "input",
                () => {

                    slugWasManuallyEdited =
                        true;
                }
            );
        }


        if (titleInput) {

            titleInput.addEventListener(
                "input",
                () => {

                    /*
                        Auto-generate slug only when creating
                        a new article.
                    */

                    if (
                        !currentArticleId &&
                        !slugWasManuallyEdited &&
                        slugInput
                    ) {

                        slugInput.value =
                            createSlug(
                                titleInput.value
                            );
                    }


                    /*
                        Keep SEO title synchronized until
                        manually edited.
                    */

                    if (
                        seoTitleInput &&
                        !seoTitleInput.dataset.userEdited
                    ) {

                        seoTitleInput.value =
                            titleInput.value;
                    }
                }
            );
        }


        /* =====================================================
           SEO TITLE MANUAL TRACKING
        ===================================================== */

        if (seoTitleInput) {

            seoTitleInput.addEventListener(
                "input",
                () => {

                    seoTitleInput.dataset.userEdited =
                        "true";
                }
            );
        }


        /* =====================================================
           GENERATE SLUG BUTTON
        ===================================================== */

        if (generateSlugButton) {

            generateSlugButton.addEventListener(
                "click",
                () => {

                    if (
                        !titleInput ||
                        !slugInput
                    ) {

                        return;
                    }


                    slugInput.value =
                        createSlug(
                            titleInput.value
                        );


                    slugWasManuallyEdited =
                        true;
                }
            );
        }


        /* =====================================================
           SEO DESCRIPTION COUNT
        ===================================================== */

        updateSeoDescriptionCount(
            seoDescriptionInput,
            seoDescriptionCount
        );


        if (seoDescriptionInput) {

            seoDescriptionInput.addEventListener(
                "input",
                () => {

                    updateSeoDescriptionCount(
                        seoDescriptionInput,
                        seoDescriptionCount
                    );
                }
            );
        }


        /* =====================================================
           INITIALIZE ARTICLE EDITOR TOOLBAR

           This was previously missing. The toolbar buttons
           (H2, H3, Paragraph, Bold, Quote, List, Takeaway,
           Note) existed in the HTML and had click handlers
           defined further down in this file, but the function
           that actually wires them up was never called here —
           so nothing happened when they were clicked.
        ===================================================== */

        setupEditorToolbar(
            contentInput
        );


        /* =====================================================
           FEATURED IMAGE UPLOAD
        ===================================================== */

        if (featuredImageInput) {

            featuredImageInput.addEventListener(
                "change",
                async () => {

                    const file =
                        featuredImageInput
                            .files?.[0];


                    if (!file) {

                        return;
                    }


                    clearMessage(
                        editorMessage
                    );


                    /* =========================================
                       CLIENT-SIDE VALIDATION
                    ========================================= */

                    const validationError =
                        validateImageFile(
                            file
                        );


                    if (validationError) {

                        featuredImageInput.value =
                            "";


                        showMessage(
                            editorMessage,
                            validationError,
                            "error"
                        );


                        return;
                    }


                    /* =========================================
                       UPLOAD
                    ========================================= */

                    try {

                        imageUploadInProgress =
                            true;


                        featuredImageInput.disabled =
                            true;


                        setEditorButtonsDisabled(
                            true,
                            saveDraftButton,
                            publishButton
                        );


                        showMessage(
                            editorMessage,
                            "Uploading image...",
                            "info"
                        );


                        const uploadedImage =
                            await uploadFeaturedImage(
                                file
                            );


                        /* =====================================
                           SAVE RETURNED URL
                        ===================================== */

                        if (featuredImageUrl) {

                            featuredImageUrl.value =
                                uploadedImage.url;
                        }


                        imageWasRemoved =
                            false;


                        /* =====================================
                           PREVIEW
                        ===================================== */

                        updateImagePreview(
                            uploadedImage.url,
                            imagePreview,
                            imagePreviewElement,
                            removeImageButton,
                            imageAltInput?.value.trim() ||
                            titleInput?.value.trim() ||
                            file.name
                        );


                        /* =====================================
                           AUTO ALT TEXT
                        ===================================== */

                        if (
                            imageAltInput &&
                            !imageAltInput.value.trim()
                        ) {

                            imageAltInput.value =
                                createImageAltFromFilename(
                                    file.name
                                );
                        }


                        showMessage(
                            editorMessage,
                            "Image uploaded successfully. Save or publish the article to attach it.",
                            "success"
                        );


                    } catch (error) {

                        console.error(
                            "Image upload failed:",
                            error
                        );


                        featuredImageInput.value =
                            "";


                        showMessage(
                            editorMessage,
                            error.message ||
                            "Failed to upload image.",
                            "error"
                        );


                    } finally {

                        imageUploadInProgress =
                            false;


                        featuredImageInput.disabled =
                            false;


                        setEditorButtonsDisabled(
                            false,
                            saveDraftButton,
                            publishButton
                        );
                    }
                }
            );
        }


        /* =====================================================
           REMOVE FEATURED IMAGE
        ===================================================== */

        if (removeImageButton) {

            removeImageButton.addEventListener(
                "click",
                () => {

                    const hasImage =
                        Boolean(
                            featuredImageUrl
                                ?.value
                                .trim()
                        );


                    if (!hasImage) {

                        return;
                    }


                    const confirmed =
                        window.confirm(
                            "Remove the featured image from this article?"
                        );


                    if (!confirmed) {

                        return;
                    }


                    if (featuredImageUrl) {

                        featuredImageUrl.value =
                            "";
                    }


                    if (featuredImageInput) {

                        featuredImageInput.value =
                            "";
                    }


                    imageWasRemoved =
                        true;


                    updateImagePreview(
                        "",
                        imagePreview,
                        imagePreviewElement,
                        removeImageButton
                    );


                    showMessage(
                        editorMessage,
                        "Featured image removed from the article. Save or publish the article to apply the change.",
                        "info"
                    );
                }
            );
        }


        /* =====================================================
           IMAGE ALT PREVIEW UPDATE
        ===================================================== */

        if (imageAltInput) {

            imageAltInput.addEventListener(
                "input",
                () => {

                    if (
                        imagePreviewElement &&
                        imagePreviewElement.src
                    ) {

                        imagePreviewElement.alt =
                            imageAltInput.value.trim() ||
                            titleInput?.value.trim() ||
                            "Featured image";
                    }
                }
            );
        }


        /* =====================================================
           SAVE DRAFT
        ===================================================== */

        if (saveDraftButton) {

            saveDraftButton.addEventListener(
                "click",
                async () => {

                    if (imageUploadInProgress) {

                        showMessage(
                            editorMessage,
                            "Please wait until the image upload finishes.",
                            "info"
                        );

                        return;
                    }


                    const savedArticle =
                        await submitArticle({
                            desiredStatus:
                                "draft",

                            currentArticleId,

                            imageWasRemoved,

                            titleInput,
                            slugInput,
                            categoryInput,
                            authorInput,
                            excerptInput,
                            contentInput,
                            seoTitleInput,
                            seoDescriptionInput,
                            featuredCheckbox,
                            featuredImageUrl,
                            imageAltInput,
                            statusInput,
                            currentStatus,
                            editorMessage,
                            saveDraftButton,
                            publishButton
                        });


                    if (savedArticle) {

                        currentArticleId =
                            String(
                                savedArticle.id
                            );


                        imageWasRemoved =
                            false;
                    }
                }
            );
        }


        /* =====================================================
           PUBLISH ARTICLE
        ===================================================== */

        if (publishButton) {

            publishButton.addEventListener(
                "click",
                async () => {

                    if (imageUploadInProgress) {

                        showMessage(
                            editorMessage,
                            "Please wait until the image upload finishes.",
                            "info"
                        );

                        return;
                    }


                    const savedArticle =
                        await submitArticle({
                            desiredStatus:
                                "published",

                            currentArticleId,

                            imageWasRemoved,

                            titleInput,
                            slugInput,
                            categoryInput,
                            authorInput,
                            excerptInput,
                            contentInput,
                            seoTitleInput,
                            seoDescriptionInput,
                            featuredCheckbox,
                            featuredImageUrl,
                            imageAltInput,
                            statusInput,
                            currentStatus,
                            editorMessage,
                            saveDraftButton,
                            publishButton
                        });


                    if (savedArticle) {

                        currentArticleId =
                            String(
                                savedArticle.id
                            );


                        imageWasRemoved =
                            false;
                    }
                }
            );
        }


        /* =====================================================
           PREVENT NORMAL FORM SUBMIT
        ===================================================== */

        if (articleForm) {

            articleForm.addEventListener(
                "submit",
                event => {

                    event.preventDefault();
                }
            );
        }


        /* =====================================================
           PREVIEW
           Will be connected later.
        ===================================================== */

        if (previewButton) {

            previewButton.disabled =
                true;
        }


        /* =====================================================
           LOGOUT
        ===================================================== */

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                async () => {

                    try {

                        await fetch(
                            `${API_BASE_URL}/auth/logout`,
                            {
                                method:
                                    "POST",

                                credentials:
                                    "include"
                            }
                        );


                    } catch (error) {

                        console.error(
                            "Logout error:",
                            error
                        );
                    }


                    window.location.href =
                        "./login.html";
                }
            );
        }
    }
);


/* =========================================================
   VERIFY ADMIN SESSION
========================================================= */

async function verifyAdminSession() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/me`,
                {
                    method:
                        "GET",

                    credentials:
                        "include",

                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            return false;
        }


        const data =
            await response.json();


        return Boolean(
            data &&
            data.success === true &&
            data.admin
        );


    } catch (error) {

        console.error(
            "Admin authentication check failed:",
            error
        );


        return false;
    }
}


/* =========================================================
   LOAD ADMIN ARTICLE
========================================================= */

async function loadAdminArticle(
    articleId
) {

    const response =
        await fetch(
            `${ARTICLE_API_URL}/admin/${encodeURIComponent(
                articleId
            )}`,
            {
                method:
                    "GET",

                credentials:
                    "include",

                headers: {
                    Accept:
                        "application/json"
                }
            }
        );


    const data =
        await response
            .json()
            .catch(
                () => null
            );


    if (
        response.status === 401 ||
        response.status === 403
    ) {

        window.location.href =
            "./login.html";


        throw new Error(
            "Authentication required."
        );
    }


    if (response.status === 404) {

        throw new Error(
            "Article not found."
        );
    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            "Failed to load article."
        );
    }


    if (
        !data ||
        data.success !== true ||
        !data.article
    ) {

        throw new Error(
            "Invalid article response."
        );
    }


    return data.article;
}


/* =========================================================
   POPULATE EDITOR FORM
========================================================= */

function populateEditorForm(
    article,
    fields
) {

    if (fields.titleInput) {

        fields.titleInput.value =
            article.title || "";
    }


    if (fields.slugInput) {

        fields.slugInput.value =
            article.slug || "";
    }


    if (fields.categoryInput) {

        fields.categoryInput.value =
            article.category || "";
    }


    if (fields.authorInput) {

        fields.authorInput.value =
            article.author ||
            "MindThinkMedia";
    }


    if (fields.excerptInput) {

        fields.excerptInput.value =
            article.excerpt || "";
    }


    if (fields.contentInput) {

        fields.contentInput.value =
            article.content || "";
    }


    if (fields.seoTitleInput) {

        fields.seoTitleInput.value =
            article.seo_title ||
            article.title ||
            "";


        fields.seoTitleInput.dataset.userEdited =
            "true";
    }


    if (fields.seoDescriptionInput) {

        fields.seoDescriptionInput.value =
            article.seo_description ||
            article.excerpt ||
            "";
    }


    if (fields.featuredCheckbox) {

        fields.featuredCheckbox.checked =
            article.featured === true;
    }


    if (fields.featuredImageUrl) {

        fields.featuredImageUrl.value =
            article.featured_image ||
            "";
    }


    if (fields.imageAltInput) {

        fields.imageAltInput.value =
            article.image_alt ||
            "";
    }


    setStatus(
        article.status === "published"
            ? "published"
            : "draft",
        fields.statusInput,
        fields.currentStatus
    );
}


/* =========================================================
   SUBMIT ARTICLE
   CREATE OR UPDATE
========================================================= */

async function submitArticle({
    desiredStatus,
    currentArticleId,
    imageWasRemoved,
    titleInput,
    slugInput,
    categoryInput,
    authorInput,
    excerptInput,
    contentInput,
    seoTitleInput,
    seoDescriptionInput,
    featuredCheckbox,
    featuredImageUrl,
    imageAltInput,
    statusInput,
    currentStatus,
    editorMessage,
    saveDraftButton,
    publishButton
}) {

    clearMessage(
        editorMessage
    );


    /* =====================================================
       VALIDATION
    ===================================================== */

    const valid =
        validateArticleForm({
            titleInput,
            slugInput,
            categoryInput,
            excerptInput,
            contentInput,
            editorMessage
        });


    if (!valid) {

        return null;
    }


    /* =====================================================
       FEATURED IMAGE VALUE
    ===================================================== */

    let featuredImageValue =
        featuredImageUrl
            ?.value
            .trim() ||
        null;


    /*
        Current updateArticle controller preserves the
        previous image when null is supplied.

        Sending "" explicitly allows the current article
        image to be cleared.

        Later we can update the backend controller so it
        stores NULL instead.
    */

    if (imageWasRemoved) {

        featuredImageValue =
            "";
    }


    /* =====================================================
       PAYLOAD
    ===================================================== */

    const payload = {

        title:
            titleInput.value.trim(),

        slug:
            createSlug(
                slugInput.value
            ),

        excerpt:
            excerptInput.value.trim(),

        content:
            contentInput.value.trim(),

        category:
            categoryInput.value.trim(),

        author:
            authorInput
                ?.value
                .trim() ||
            "MindThinkMedia",

        featured_image:
            featuredImageValue,

        image_alt:
            imageAltInput
                ?.value
                .trim() ||
            null,

        seo_title:
            seoTitleInput
                ?.value
                .trim() ||
            titleInput.value.trim(),

        seo_description:
            seoDescriptionInput
                ?.value
                .trim() ||
            excerptInput.value.trim(),

        status:
            desiredStatus,

        featured:
            featuredCheckbox
                ?.checked === true
    };


    /* =====================================================
       CREATE VS UPDATE
    ===================================================== */

    const isEditMode =
        Boolean(
            currentArticleId
        );


    const requestUrl =
        isEditMode
            ? `${ARTICLE_API_URL}/${encodeURIComponent(
                currentArticleId
            )}`
            : ARTICLE_API_URL;


    const requestMethod =
        isEditMode
            ? "PUT"
            : "POST";


    /* =====================================================
       LOADING STATE
    ===================================================== */

    setButtonsLoading(
        true,
        saveDraftButton,
        publishButton
    );


    try {

        const response =
            await fetch(
                requestUrl,
                {
                    method:
                        requestMethod,

                    credentials:
                        "include",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const data =
            await response
                .json()
                .catch(
                    () => null
                );


        /* =================================================
           AUTH EXPIRED
        ================================================= */

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            showMessage(
                editorMessage,
                "Your admin session has expired. Please log in again.",
                "error"
            );


            setTimeout(
                () => {

                    window.location.href =
                        "./login.html";

                },
                1200
            );


            return null;
        }


        /* =================================================
           NOT FOUND
        ================================================= */

        if (response.status === 404) {

            showMessage(
                editorMessage,
                data?.message ||
                "This article no longer exists.",
                "error"
            );


            return null;
        }


        /* =================================================
           DUPLICATE SLUG
        ================================================= */

        if (response.status === 409) {

            showMessage(
                editorMessage,
                data?.message ||
                "Another article already uses this slug.",
                "error"
            );


            slugInput?.focus();


            return null;
        }


        /* =================================================
           OTHER API ERROR
        ================================================= */

        if (!response.ok) {

            showMessage(
                editorMessage,
                data?.message ||
                "Failed to save article.",
                "error"
            );


            return null;
        }


        if (
            !data ||
            data.success !== true ||
            !data.article
        ) {

            showMessage(
                editorMessage,
                "The server returned an invalid article response.",
                "error"
            );


            return null;
        }


        /* =================================================
           SUCCESS
        ================================================= */

        const savedArticle =
            data.article;


        setStatus(
            savedArticle.status ===
            "published"
                ? "published"
                : "draft",
            statusInput,
            currentStatus
        );


        updateEditModeUI(
            savedArticle
        );


        if (
            savedArticle.status ===
            "published"
        ) {

            showMessage(
                editorMessage,
                isEditMode
                    ? "Article updated and published successfully."
                    : "Article published successfully.",
                "success"
            );


        } else {

            showMessage(
                editorMessage,
                isEditMode
                    ? "Draft updated successfully."
                    : "Draft saved successfully.",
                "success"
            );
        }


        /* =================================================
           NEW ARTICLE → SWITCH TO EDIT URL
        ================================================= */

        if (!isEditMode) {

            const newUrl =
                `article-editor.html?id=${encodeURIComponent(
                    savedArticle.id
                )}`;


            window.history.replaceState(
                {},
                "",
                newUrl
            );


            /*
                Reload once so all database values,
                including the image URL and timestamps,
                are loaded exactly from PostgreSQL.
            */

            setTimeout(
                () => {

                    window.location.reload();

                },
                900
            );


        } else {

            updateEditModeUI(
                savedArticle
            );
        }


        return savedArticle;


    } catch (error) {

        console.error(
            "Article save request failed:",
            error
        );


        showMessage(
            editorMessage,
            "Unable to connect to the MindThinkMedia backend.",
            "error"
        );


        return null;


    } finally {

        setButtonsLoading(
            false,
            saveDraftButton,
            publishButton
        );
    }
}


/* =========================================================
   VALIDATE ARTICLE FORM
========================================================= */

function validateArticleForm({
    titleInput,
    slugInput,
    categoryInput,
    excerptInput,
    contentInput,
    editorMessage
}) {

    const title =
        titleInput
            ?.value
            .trim() ||
        "";


    const slug =
        slugInput
            ?.value
            .trim() ||
        "";


    const category =
        categoryInput
            ?.value
            .trim() ||
        "";


    const excerpt =
        excerptInput
            ?.value
            .trim() ||
        "";


    const content =
        contentInput
            ?.value
            .trim() ||
        "";


    if (!title) {

        showMessage(
            editorMessage,
            "Please enter an article title.",
            "error"
        );


        titleInput?.focus();


        return false;
    }


    if (!slug) {

        showMessage(
            editorMessage,
            "Please enter or generate an article slug.",
            "error"
        );


        slugInput?.focus();


        return false;
    }


    if (!category) {

        showMessage(
            editorMessage,
            "Please select an article category.",
            "error"
        );


        categoryInput?.focus();


        return false;
    }


    if (!excerpt) {

        showMessage(
            editorMessage,
            "Please enter an article excerpt.",
            "error"
        );


        excerptInput?.focus();


        return false;
    }


    if (!content) {

        showMessage(
            editorMessage,
            "Please enter the article content.",
            "error"
        );


        contentInput?.focus();


        return false;
    }


    return true;
}


/* =========================================================
   IMAGE VALIDATION
========================================================= */

function validateImageFile(
    file
) {

    if (!file) {

        return "Please choose an image.";
    }


    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (
        !allowedTypes.includes(
            file.type
        )
    ) {

        return "Only JPG, PNG and WebP images are allowed.";
    }


    const maximumSize =
        5 * 1024 * 1024;


    if (
        file.size >
        maximumSize
    ) {

        return "Image is too large. Maximum size is 5 MB.";
    }


    return null;
}


/* =========================================================
   UPLOAD FEATURED IMAGE
========================================================= */

async function uploadFeaturedImage(
    file
) {

    const formData =
        new FormData();


    formData.append(
        "image",
        file
    );


    /*
        Do NOT manually set Content-Type here.

        The browser automatically creates the correct
        multipart/form-data boundary.
    */

    const response =
        await fetch(
            MEDIA_UPLOAD_URL,
            {
                method:
                    "POST",

                credentials:
                    "include",

                body:
                    formData
            }
        );


    const data =
        await response
            .json()
            .catch(
                () => null
            );


    if (
        response.status === 401 ||
        response.status === 403
    ) {

        window.location.href =
            "./login.html";


        throw new Error(
            "Authentication required."
        );
    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            "Failed to upload image."
        );
    }


    if (
        !data ||
        data.success !== true ||
        !data.image ||
        !data.image.url
    ) {

        throw new Error(
            "Invalid image upload response."
        );
    }


    return data.image;
}


/* =========================================================
   UPDATE IMAGE PREVIEW
========================================================= */

function updateImagePreview(
    imageUrl,
    previewContainer,
    previewImage,
    removeButton,
    altText = "Featured image preview"
) {

    if (
        !previewContainer ||
        !previewImage
    ) {

        return;
    }


    /* =====================================================
       NO IMAGE
    ===================================================== */

    if (!imageUrl) {

        previewContainer.hidden =
            true;


        previewImage.removeAttribute(
            "src"
        );


        previewImage.alt =
            "";


        if (removeButton) {

            removeButton.hidden =
                true;
        }


        return;
    }


    /* =====================================================
       IMAGE EXISTS
    ===================================================== */

    previewImage.src =
        createBackendImageUrl(
            imageUrl
        );


    previewImage.alt =
        altText ||
        "Featured image preview";


    previewContainer.hidden =
        false;


    if (removeButton) {

        removeButton.hidden =
            false;
    }
}


/* =========================================================
   CREATE PUBLIC BACKEND IMAGE URL
========================================================= */

function createBackendImageUrl(
    imageUrl
) {

    if (!imageUrl) {

        return "";
    }


    /*
        Already absolute URL.
    */

    if (
        imageUrl.startsWith(
            "http://"
        ) ||
        imageUrl.startsWith(
            "https://"
        )
    ) {

        return imageUrl;
    }


    const backendOrigin =
        API_BASE_URL.replace(
            /\/api$/,
            ""
        );


    if (
        imageUrl.startsWith("/")
    ) {

        return `${backendOrigin}${imageUrl}`;
    }


    return `${backendOrigin}/${imageUrl}`;
}


/* =========================================================
   CREATE IMAGE ALT TEXT FROM FILENAME
========================================================= */

function createImageAltFromFilename(
    filename
) {

    const name =
        String(
            filename || ""
        )
            .replace(
                /\.[^.]+$/,
                ""
            )
            .replace(
                /[-_]+/g,
                " "
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if (!name) {

        return "";
    }


    return name
        .charAt(0)
        .toUpperCase() +
        name.slice(1);
}


/* =========================================================
   CREATE SLUG
========================================================= */

function createSlug(
    value
) {

    return String(
        value || ""
    )
        .toLowerCase()
        .trim()

        .replace(
            /['’]/g,
            ""
        )

        .replace(
            /[^a-z0-9]+/g,
            "-"
        )

        .replace(
            /-+/g,
            "-"
        )

        .replace(
            /^-+|-+$/g,
            ""
        );
}


/* =========================================================
   SET STATUS
========================================================= */

function setStatus(
    status,
    statusInput,
    statusBadge
) {

    const normalizedStatus =
        status === "published"
            ? "published"
            : "draft";


    if (statusInput) {

        statusInput.value =
            normalizedStatus;
    }


    if (!statusBadge) {

        return;
    }


    statusBadge.classList.remove(
        "status-draft",
        "status-published"
    );


    if (
        normalizedStatus ===
        "published"
    ) {

        statusBadge.textContent =
            "Published";


        statusBadge.classList.add(
            "status-published"
        );


    } else {

        statusBadge.textContent =
            "Draft";


        statusBadge.classList.add(
            "status-draft"
        );
    }
}


/* =========================================================
   SEO DESCRIPTION COUNT
========================================================= */

function updateSeoDescriptionCount(
    input,
    counter
) {

    if (
        !input ||
        !counter
    ) {

        return;
    }


    const length =
        input.value.length;


    counter.textContent =
        `${length} characters`;
}


/* =========================================================
   EDITOR TOOLBAR

   Wires up every button in the toolbar. Buttons carry
   either a data-tag (H2, H3, Paragraph, Bold, Quote, List)
   or a data-block (Takeaway, Note) attribute — this is the
   single place that reads that attribute and dispatches to
   the right insert function.

   This is the ONLY definition of this function in the file.
   (Previously it was defined twice — once dead, nested
   inside the DOMContentLoaded handler and never called,
   and once here at the bottom, also never called, and that
   copy only handled data-tag, not data-block.)
========================================================= */

function setupEditorToolbar(
    contentInput
) {

    if (!contentInput) {

        return;
    }


    const tools =
        document.querySelectorAll(
            ".editor-tool"
        );


    tools.forEach(
        tool => {

            tool.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    const tag =
                        tool.dataset.tag;


                    const block =
                        tool.dataset.block;


                    if (tag) {

                        applyEditorTag(
                            contentInput,
                            tag
                        );

                        return;
                    }


                    if (block) {

                        applyEditorBlock(
                            contentInput,
                            block
                        );
                    }

                }
            );

        }
    );

}


/* =========================================================
   APPLY EDITOR TAG

   Wraps the current textarea selection in a standard HTML
   tag (H2, H3, paragraph, bold, blockquote, or a bullet
   list). This function was referenced by the toolbar but
   was never actually defined anywhere in the file — that
   missing definition was the root cause of the toolbar
   silently doing nothing.
========================================================= */

function applyEditorTag(
    textarea,
    tag
) {

    if (
        !textarea ||
        !tag
    ) {

        return;
    }


    const start =
        textarea.selectionStart;

    const end =
        textarea.selectionEnd;


    const selectedText =
        textarea.value.substring(
            start,
            end
        );


    let replacement = "";


    switch (tag) {

        case "h2":

            replacement =
                `<h2>${selectedText || "Section heading"}</h2>`;

            break;


        case "h3":

            replacement =
                `<h3>${selectedText || "Subheading"}</h3>`;

            break;


        case "p":

            replacement =
                `<p>${selectedText || "Write your paragraph here."}</p>`;

            break;


        case "strong":

            replacement =
                `<strong>${selectedText || "Bold text"}</strong>`;

            break;


        case "blockquote":

            replacement =
                `<blockquote>${selectedText || "Write the quote here."}</blockquote>`;

            break;


        case "ul":

            replacement =
`<ul>
    <li>${selectedText || "List item"}</li>
</ul>`;

            break;


        default:

            return;
    }


    textarea.setRangeText(
        replacement,
        start,
        end,
        "end"
    );


    textarea.focus();


    /*
        Fire input event so any future listeners
        (autosave, word count, etc.) stay in sync.
    */

    textarea.dispatchEvent(
        new Event(
            "input",
            {
                bubbles: true
            }
        )
    );

}


/* =========================================================
   APPLY UNIVERSAL EDITOR BLOCK

   These blocks are stored as normal HTML inside the existing
   article content field. No database schema changes required.
========================================================= */

function applyEditorBlock(
    textarea,
    block
) {

    if (
        !textarea ||
        !block
    ) {
        return;
    }


    const start =
        textarea.selectionStart;

    const end =
        textarea.selectionEnd;


    const selectedText =
        textarea.value.substring(
            start,
            end
        );


    let replacement = "";


    /* =====================================================
       KEY TAKEAWAY
    ===================================================== */

    if (block === "takeaway") {

        replacement =
`<div class="article-callout">
    <div class="article-callout-title">
        Key Takeaway
    </div>

    <p>${selectedText || "Write the most important takeaway here."}</p>
</div>`;

    }


    /* =====================================================
       IMPORTANT NOTE
    ===================================================== */

    else if (block === "note") {

        replacement =
`<div class="article-note">
    <strong>Important Note</strong>

    <p>${selectedText || "Write the important note here."}</p>
</div>`;

    }


    /* =====================================================
       UNKNOWN BLOCK
    ===================================================== */

    else {

        return;

    }


    /* =====================================================
       INSERT INTO TEXTAREA
    ===================================================== */

    const prefix =
        start > 0 &&
        textarea.value[start - 1] !== "\n"
            ? "\n\n"
            : "";


    const suffix =
        end < textarea.value.length &&
        textarea.value[end] !== "\n"
            ? "\n\n"
            : "";


    const finalReplacement =
        prefix +
        replacement +
        suffix;


    textarea.setRangeText(
        finalReplacement,
        start,
        end,
        "end"
    );


    textarea.focus();


    /* =====================================================
       FIRE INPUT EVENT

       Keeps any future editor listeners synchronized.
    ===================================================== */

    textarea.dispatchEvent(
        new Event(
            "input",
            {
                bubbles: true
            }
        )
    );

}

/* =========================================================
   ARTICLE SAVE BUTTON LOADING
========================================================= */

function setButtonsLoading(
    loading,
    saveDraftButton,
    publishButton
) {

    if (saveDraftButton) {

        saveDraftButton.disabled =
            loading;


        saveDraftButton.textContent =
            loading
                ? "Saving..."
                : "Save Draft";
    }


    if (publishButton) {

        publishButton.disabled =
            loading;


        publishButton.textContent =
            loading
                ? "Publishing..."
                : "Publish Article";
    }
}


/* =========================================================
   ENABLE / DISABLE EDITOR SAVE BUTTONS
========================================================= */

function setEditorButtonsDisabled(
    disabled,
    saveDraftButton,
    publishButton
) {

    if (saveDraftButton) {

        saveDraftButton.disabled =
            disabled;
    }


    if (publishButton) {

        publishButton.disabled =
            disabled;
    }
}


/* =========================================================
   SHOW MESSAGE
========================================================= */

function showMessage(
    element,
    message,
    type = "info"
) {

    if (!element) {

        return;
    }


    element.hidden =
        false;


    element.textContent =
        message;


    element.classList.remove(
        "success",
        "error",
        "info",
        "admin-message-success",
        "admin-message-error",
        "admin-message-info"
    );


    if (
        type === "success"
    ) {

        element.classList.add(
            "success"
        );


    } else if (
        type === "error"
    ) {

        element.classList.add(
            "error"
        );


    } else {

        element.classList.add(
            "info"
        );
    }
}


/* =========================================================
   CLEAR MESSAGE
========================================================= */

function clearMessage(
    element
) {

    if (!element) {

        return;
    }


    element.hidden =
        true;


    element.textContent =
        "";


    element.classList.remove(
        "success",
        "error",
        "info",
        "admin-message-success",
        "admin-message-error",
        "admin-message-info"
    );
}


/* =========================================================
   UPDATE EDIT MODE UI
========================================================= */

function updateEditModeUI(
    article
) {

    const editorHeading =
        document.getElementById(
            "editorHeading"
        );


    const editorDescription =
        document.getElementById(
            "editorDescription"
        );


    const articleInfoCard =
        document.getElementById(
            "articleInfoCard"
        );


    const articleIdValue =
        document.getElementById(
            "articleIdValue"
        );


    const articleCreatedValue =
        document.getElementById(
            "articleCreatedValue"
        );


    const articleUpdatedValue =
        document.getElementById(
            "articleUpdatedValue"
        );


    const articlePublishedValue =
        document.getElementById(
            "articlePublishedValue"
        );


    if (editorHeading) {

        editorHeading.textContent =
            "Edit Article";
    }


    if (editorDescription) {

        editorDescription.textContent =
            "Update this MindThinkMedia article and manage its publishing status.";
    }


    if (articleInfoCard) {

        articleInfoCard.hidden =
            false;
    }


    if (articleIdValue) {

        articleIdValue.textContent =
            article.id ?? "—";
    }


    if (articleCreatedValue) {

        articleCreatedValue.textContent =
            formatEditorDate(
                article.created_at
            );
    }


    if (articleUpdatedValue) {

        articleUpdatedValue.textContent =
            formatEditorDate(
                article.updated_at
            );
    }


    if (articlePublishedValue) {

        articlePublishedValue.textContent =
            article.published_at
                ? formatEditorDate(
                    article.published_at
                )
                : "Not published";
    }
}


/* =========================================================
   FORMAT EDITOR DATE
========================================================= */

function formatEditorDate(
    value
) {

    if (!value) {

        return "—";
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
        );
    }


    return date.toLocaleString(
        "en-IN",
        {
            year:
                "numeric",

            month:
                "short",

            day:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );
}