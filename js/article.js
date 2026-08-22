/* =========================================================
   MINDTHINKMEDIA
   ARTICLE PAGE RENDERING ENGINE
   PostgreSQL + Express API

   RESPONSIBILITY
   ---------------------------------------------------------
   • Read article slug from URL
   • Fetch published article from PostgreSQL API
   • Render article
   • Render article metadata
   • Render featured image
   • Generate reading time
   • Generate table of contents
   • Generate SEO metadata
   • Generate structured data
   • Fetch related articles from PostgreSQL
   • Render related article cards
   • Render sidebar related articles
   • Handle invalid / missing articles
   • Apply per-category "spine" accent colour
   • Track scroll position with a reading progress bar

   PUBLIC ARTICLE URL
   ---------------------------------------------------------
   article.html?slug=article-slug

   IMPORTANT
   ---------------------------------------------------------
   Public API only returns published articles.
========================================================= */


/* =========================================================
   API CONFIGURATION
========================================================= */

const BACKEND_ORIGIN =
    "https://mindthinkmedia.onrender.com";

const ARTICLE_API_BASE_URL =
    `${BACKEND_ORIGIN}/api/articles`;


/* =========================================================
   CATEGORY "SPINE" COLOURS

   Each category gets its own accent — like a different
   coloured spine on the same shelf — so one universal
   layout can carry AI, finance, health, books, movies and
   life-lesson pieces without ever feeling generic.

   Falls back to the brand teal for any category not
   listed here, so new categories never break styling.
========================================================= */

const CATEGORY_SPINE_COLORS = {

    "ai & technology": "#1E5F5B",
    "technology":       "#1E5F5B",
    "ai":               "#1E5F5B",

    "finance":          "#9C6B1F",
    "money":            "#9C6B1F",

    "health":           "#4C7A5E",
    "wellness":         "#4C7A5E",

    "life lessons":     "#A85C3E",
    "discussions":      "#A85C3E",
    "ideas":            "#A85C3E",

    "books":            "#6B4A6E",
    "book recommendations": "#6B4A6E",
    "stories":          "#6B4A6E",

    "movies":           "#3E5C76",
    "movie suggestions": "#3E5C76",

    "students":         "#46507A",
    "lifestyle":        "#A85C3E"

};


const DEFAULT_SPINE_COLOR =
    "#1E5F5B";


function getCategorySpineColor(
    category
) {

    if (!category) {

        return DEFAULT_SPINE_COLOR;

    }


    const key =
        String(category)
            .trim()
            .toLowerCase();


    return (
        CATEGORY_SPINE_COLORS[key] ||
        DEFAULT_SPINE_COLOR
    );

}


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /* =====================================================
           GET ARTICLE SLUG
        ===================================================== */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const articleSlug =
            params.get("slug");


        /* =====================================================
           PAGE ELEMENTS
        ===================================================== */

        const articlePage =
            document.querySelector(
                ".article-page"
            );

        const articleTitle =
            document.getElementById(
                "articleTitle"
            );

        const articleExcerpt =
            document.getElementById(
                "articleExcerpt"
            );

        const articleCategory =
            document.getElementById(
                "articleCategory"
            );

        const articleAuthor =
            document.getElementById(
                "articleAuthor"
            );

        const articleDate =
            document.getElementById(
                "articleDate"
            );

        const articleUpdated =
            document.getElementById(
                "articleUpdated"
            );

        const articleReadTime =
            document.getElementById(
                "articleReadTime"
            );

        const articleImage =
            document.getElementById(
                "articleImage"
            );

        const articleImageCaption =
            document.getElementById(
                "articleImageCaption"
            );

        const articleContent =
            document.getElementById(
                "articleContent"
            );

        const articleConclusion =
            document.getElementById(
                "articleConclusion"
            );

        const breadcrumbCategory =
            document.getElementById(
                "breadcrumbCategory"
            );

        const breadcrumbTitle =
            document.getElementById(
                "breadcrumbTitle"
            );

        const articleToc =
            document.getElementById(
                "articleToc"
            );

        const tocContent =
            document.getElementById(
                "tocContent"
            );

        const relatedArticles =
            document.getElementById(
                "relatedArticles"
            );

        const sidebarRelated =
            document.getElementById(
                "sidebarRelated"
            );


        /* =====================================================
           INVALID ARTICLE URL
        ===================================================== */

        if (!articleSlug) {

            showArticleError(
                "No article was selected.",
                "Please return to MindThinkMedia and choose an article."
            );

            return;
        }


        /* =====================================================
           FETCH ARTICLE FROM POSTGRESQL
        ===================================================== */

        let article;


        try {

            article =
                await fetchArticleBySlug(
                    articleSlug
                );

        } catch (error) {

            console.error(
                "Failed to load article:",
                error
            );


            if (
                error &&
                error.status === 404
            ) {

                showArticleError(
                    "Article not found.",
                    "The article you are looking for may have been removed, unpublished, or the link may be incorrect."
                );

                return;
            }


            showArticleError(
                "Unable to load article.",
                "The article could not be loaded right now. Please try again later."
            );

            return;
        }


        /* =====================================================
           APPLY SPINE COLOUR

           Custom properties inherit, so setting this once on
           .article-page colours the category badge, headings,
           links, TOC, CTA and progress bar together.
        ===================================================== */

        if (articlePage) {

            articlePage.style.setProperty(
                "--spine-color",
                getCategorySpineColor(
                    article.category
                )
            );

        }


        /* =====================================================
           BASIC INFORMATION
        ===================================================== */

        document.title =
            `${article.seoTitle || article.title} | MindThinkMedia`;


        if (articleTitle) {

            articleTitle.textContent =
                article.title;

        }


        if (articleExcerpt) {

            articleExcerpt.textContent =
                article.excerpt || "";

        }


        if (articleCategory) {

            articleCategory.textContent =
                article.category || "";

        }


        if (articleAuthor) {

            articleAuthor.textContent =
                article.author ||
                "MindThinkMedia";

        }


        if (articleDate) {

            articleDate.textContent =
                formatDate(
                    article.date
                );

        }


        if (articleReadTime) {

            articleReadTime.textContent =
                article.readTime || "";

        }


        /* =====================================================
           UPDATED DATE
        ===================================================== */

        if (
            articleUpdated &&
            article.updated
        ) {

            articleUpdated.textContent =
                `Updated ${formatDate(
                    article.updated
                )}`;

        } else if (articleUpdated) {

            articleUpdated.textContent =
                "";

        }


        /* =====================================================
           BREADCRUMBS
        ===================================================== */

        if (breadcrumbCategory) {

            breadcrumbCategory.textContent =
                article.category || "";

        }


        if (breadcrumbTitle) {

            breadcrumbTitle.textContent =
                article.title;

        }


        /* =====================================================
           FEATURED IMAGE
        ===================================================== */

        renderFeaturedImage(
            article,
            articleImage,
            articleImageCaption
        );


        /* =====================================================
           ARTICLE CONTENT
        ===================================================== */

        if (articleContent) {

            articleContent.innerHTML =
                article.content || "";

        }


        /* =====================================================
           CONCLUSION
        ===================================================== */

        renderConclusion(
            article,
            articleConclusion
        );


        /* =====================================================
           TABLE OF CONTENTS
        ===================================================== */

        generateTableOfContents(
            articleContent,
            articleToc,
            tocContent,
            article.toc
        );


        /* =====================================================
           RELATED ARTICLES
           POSTGRESQL / API
        ===================================================== */

        await renderRelatedArticles(
            article,
            relatedArticles,
            sidebarRelated
        );


        /* =====================================================
           SEO
        ===================================================== */

        updateSEO(
            article
        );


        /* =====================================================
           STRUCTURED DATA
        ===================================================== */

        addStructuredData(
            article
        );


        /* =====================================================
           TOC COLLAPSE
        ===================================================== */

        setupTOCToggle();


        /* =====================================================
           ARTICLE LINKS
        ===================================================== */

        setupArticleLinks();


        /* =====================================================
           READING PROGRESS
        ===================================================== */

        setupReadingProgress(
            articleContent
        );

    }
);


/* =========================================================
   FETCH ARTICLE BY SLUG
========================================================= */

async function fetchArticleBySlug(
    slug
) {

    const response =
        await fetch(
            `${ARTICLE_API_BASE_URL}/slug/${encodeURIComponent(
                slug
            )}`,
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );


    if (!response.ok) {

        const error =
            new Error(
                `Article request failed with status ${response.status}`
            );

        error.status =
            response.status;

        throw error;
    }


    const data =
        await response.json();


    if (
        !data ||
        data.success !== true ||
        !data.article
    ) {

        throw new Error(
            "Invalid article response."
        );
    }


    return normalizeDatabaseArticle(
        data.article
    );

}


/* =========================================================
   FETCH ALL PUBLISHED ARTICLES
========================================================= */

async function fetchPublishedArticles() {

    const response =
        await fetch(
            ARTICLE_API_BASE_URL,
            {
                method: "GET",
                headers: {
                    Accept:
                        "application/json"
                }
            }
        );


    if (!response.ok) {

        throw new Error(
            `Articles request failed with status ${response.status}`
        );

    }


    const data =
        await response.json();


    if (
        !data ||
        data.success !== true ||
        !Array.isArray(
            data.articles
        )
    ) {

        throw new Error(
            "Invalid articles response."
        );

    }


    return data.articles.map(
        normalizeDatabaseArticle
    );

}


/* =========================================================
   RESOLVE ARTICLE IMAGE URL
========================================================= */

function resolveArticleImageURL(
    imagePath
) {

    if (!imagePath) {

        return null;
    }


    const path =
        String(imagePath).trim();


    if (!path) {

        return null;
    }


    /*
        Already a full external URL.
    */

    if (
        path.startsWith("http://") ||
        path.startsWith("https://")
    ) {

        return path;
    }


    /*
        Uploaded image stored by backend.

        Database:
        /uploads/articles/example.jpg

        Browser needs:
        http://localhost:5000/uploads/articles/example.jpg
    */

    if (
        path.startsWith("/uploads/")
    ) {

        return `${BACKEND_ORIGIN}${path}`;
    }


    if (
        path.startsWith("uploads/")
    ) {

        return `${BACKEND_ORIGIN}/${path}`;
    }


    /*
        Preserve existing frontend/local image paths.
    */

    return path;
}


/* =========================================================
   NORMALIZE DATABASE ARTICLE
========================================================= */

function normalizeDatabaseArticle(
    article
) {

    return {

        id:
            article.id,

        title:
            article.title || "",

        slug:
            article.slug || "",

        excerpt:
            article.excerpt || "",

        content:
            article.content || "",

        category:
            article.category || "",

        author:
            article.author ||
            "MindThinkMedia",

        image:
           resolveArticleImageURL(
               article.featured_image
           ),

        imageAlt:
            article.image_alt ||
            article.title ||
            "",

        imageCaption:
            article.image_caption ||
            "",

        seoTitle:
            article.seo_title ||
            article.title ||
            "",

        seoDescription:
            article.seo_description ||
            article.excerpt ||
            "",

        featured:
            article.featured === true,

        status:
            article.status || "",

        date:
            article.published_at ||
            article.created_at ||
            null,

        updated:
            article.updated_at ||
            article.published_at ||
            article.created_at ||
            null,

        publishedAt:
            article.published_at ||
            null,

        createdAt:
            article.created_at ||
            null,

        readTime:
            calculateReadTime(
                article.content
            ),

        /*
            Database does not currently contain a TOC flag.

            By default, articles allow TOC generation.
            generateTableOfContents() automatically hides
            the TOC when fewer than 2 headings exist.
        */

        toc:
            true,

        /*
            The current PostgreSQL table does not have a
            separate conclusion column.

            If a conclusion field is added later,
            this code already supports it.
        */

        conclusion:
            article.conclusion ||
            null

    };

}


/* =========================================================
   FEATURED IMAGE
========================================================= */

function renderFeaturedImage(
    article,
    imageElement,
    captionElement
) {

    if (!imageElement) {

        return;

    }


    if (article.image) {

        imageElement.style.display =
            "";

        imageElement.src =
            article.image;

        imageElement.alt =
            article.imageAlt ||
            article.title;

        imageElement.loading =
            "eager";


        if (captionElement) {

            captionElement.textContent =
                article.imageCaption ||
                "";

        }


        return;
    }


    imageElement.removeAttribute(
        "src"
    );

    imageElement.style.display =
        "none";


    if (captionElement) {

        captionElement.textContent =
            "";

    }

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "";

    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            dateValue
        );

    }


    return date.toLocaleDateString(
        "en-US",
        {
            year:
                "numeric",

            month:
                "long",

            day:
                "numeric"
        }
    );

}


/* =========================================================
   CALCULATE READ TIME
========================================================= */

function calculateReadTime(
    content
) {

    if (!content) {

        return "";

    }


    const temporaryElement =
        document.createElement(
            "div"
        );


    temporaryElement.innerHTML =
        content;


    const text =
        temporaryElement.textContent ||
        temporaryElement.innerText ||
        "";


    const cleanText =
        text.trim();


    if (!cleanText) {

        return "1 min read";

    }


    const words =
        cleanText
            .split(/\s+/)
            .filter(Boolean)
            .length;


    const minutes =
        Math.max(
            1,
            Math.ceil(
                words / 200
            )
        );


    return `${minutes} min read`;

}


/* =========================================================
   RENDER CONCLUSION
========================================================= */

function renderConclusion(
    article,
    container
) {

    if (!container) {

        return;

    }


    if (article.conclusion) {

        container.style.display =
            "";

        container.innerHTML = `

            <span class="article-conclusion-label">
                FINAL THOUGHTS
            </span>

            <div>
                ${article.conclusion}
            </div>

        `;


        return;
    }


    /*
        If no separate conclusion exists,
        don't create artificial content.
    */

    container.innerHTML =
        "";

    container.style.display =
        "none";

}


/* =========================================================
   TABLE OF CONTENTS
========================================================= */

function generateTableOfContents(
    contentElement,
    tocElement,
    tocContainer,
    shouldShow
) {

    if (
        !contentElement ||
        !tocElement ||
        !tocContainer
    ) {

        return;

    }


    /*
        Stories and articles can explicitly
        disable the TOC later.
    */

    if (
        shouldShow === false
    ) {

        tocElement.style.display =
            "none";

        return;

    }


    const headings =
        contentElement.querySelectorAll(
            "h2, h3"
        );


    /*
        Do not show a TOC for very short articles.
    */

    if (
        headings.length < 2
    ) {

        tocElement.style.display =
            "none";

        tocContainer.innerHTML =
            "";

        return;

    }


    tocElement.style.display =
        "";

    tocContainer.innerHTML =
        "";


    headings.forEach(
        (
            heading,
            index
        ) => {

            let id =
                heading.id;


            if (!id) {

                id =
                    createHeadingId(
                        heading.textContent,
                        index
                    );

                heading.id =
                    id;

            }


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                `#${id}`;


            link.textContent =
                heading.textContent;


            if (
                heading
                    .tagName
                    .toLowerCase() ===
                "h3"
            ) {

                link.classList.add(
                    "toc-subitem"
                );

            }


            tocContainer.appendChild(
                link
            );

        }
    );

}


/* =========================================================
   CREATE HEADING ID
========================================================= */

function createHeadingId(
    text,
    index
) {

    const slug =
        String(
            text || ""
        )
            .toLowerCase()
            .trim()
            .replace(
                /[^\w\s-]/g,
                ""
            )
            .replace(
                /\s+/g,
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


    return (
        slug ||
        `section-${index + 1}`
    );

}


/* =========================================================
   TOC TOGGLE
========================================================= */

function setupTOCToggle() {

    const toggle =
        document.getElementById(
            "tocToggle"
        );


    const content =
        document.getElementById(
            "tocContent"
        );


    if (
        !toggle ||
        !content
    ) {

        return;

    }


    toggle.addEventListener(
        "click",
        () => {

            const expanded =
                toggle.getAttribute(
                    "aria-expanded"
                ) === "true";


            toggle.setAttribute(
                "aria-expanded",
                String(
                    !expanded
                )
            );


            content.style.display =
                expanded
                    ? "none"
                    : "block";


            const symbol =
                toggle.querySelector(
                    "span:last-child"
                );


            if (symbol) {

                symbol.textContent =
                    expanded
                        ? "+"
                        : "−";

            }

        }
    );

}


/* =========================================================
   READING PROGRESS

   Tracks scroll through the article body specifically
   (not the whole page), so the bar reflects progress
   through the piece itself, including its conclusion.
========================================================= */

function setupReadingProgress(
    contentElement
) {

    const bar =
        document.getElementById(
            "readingProgressBar"
        );


    if (
        !bar ||
        !contentElement
    ) {

        return;

    }


    const updateProgress =
        () => {

            const rect =
                contentElement.getBoundingClientRect();

            const contentTop =
                rect.top +
                window.scrollY;

            const contentHeight =
                contentElement.offsetHeight;

            const viewportHeight =
                window.innerHeight;

            const scrolled =
                window.scrollY -
                contentTop +
                viewportHeight * 0.4;

            const total =
                Math.max(
                    contentHeight,
                    1
                );

            const percent =
                Math.min(
                    100,
                    Math.max(
                        0,
                        (scrolled / total) * 100
                    )
                );

            bar.style.width =
                `${percent}%`;

        };


    window.addEventListener(
        "scroll",
        updateProgress,
        { passive: true }
    );


    window.addEventListener(
        "resize",
        updateProgress
    );


    updateProgress();

}


/* =========================================================
   RELATED ARTICLES
   DATABASE-DRIVEN
========================================================= */

async function renderRelatedArticles(
    currentArticle,
    mainContainer,
    sidebarContainer
) {

    try {

        /*
            GET /api/articles returns only
            published articles.

            Draft articles therefore cannot
            appear in public related articles.
        */

        const allArticles =
            await fetchPublishedArticles();


        /*
            Exclude current article first.
        */

        const otherArticles =
            allArticles.filter(
                article =>
                    Number(article.id) !==
                    Number(currentArticle.id)
            );


        /*
            First preference:
            same category.
        */

        let related =
            otherArticles.filter(
                article => {

                    if (
                        !article.category ||
                        !currentArticle.category
                    ) {

                        return false;

                    }


                    return (
                        article.category
                            .trim()
                            .toLowerCase() ===
                        currentArticle.category
                            .trim()
                            .toLowerCase()
                    );

                }
            );


        /*
            If fewer than 3 category-related articles
            are available, fill the remaining spaces
            using other published articles.
        */

        if (
            related.length < 3
        ) {

            const additional =
                otherArticles.filter(
                    article =>
                        !related.some(
                            item =>
                                Number(item.id) ===
                                Number(article.id)
                        )
                );


            related =
                related.concat(
                    additional
                );

        }


        /*
            Maximum related articles:
            3
        */

        related =
            related.slice(
                0,
                3
            );


        /* =====================================================
           NO RELATED ARTICLES
        ===================================================== */

        if (
            related.length === 0
        ) {

            renderEmptyRelatedState(
                mainContainer,
                sidebarContainer
            );

            return;
        }


        /* =====================================================
           MAIN RELATED ARTICLE CARDS
        ===================================================== */

        if (mainContainer) {

            mainContainer.innerHTML =
                "";


            related.forEach(
                article => {

                    const card =
                        document.createElement(
                            "article"
                        );


                    card.className =
                        "related-card";


                    card.style.setProperty(
                        "--card-spine",
                        getCategorySpineColor(
                            article.category
                        )
                    );


                    const imageMarkup =
                        article.image
                            ? `
                                <img
                                    src="${escapeHTML(
                                        article.image
                                    )}"
                                    alt="${escapeHTML(
                                        article.imageAlt ||
                                        article.title
                                    )}"
                                    loading="lazy"
                                >
                              `
                            : `
                                <div
                                    class="related-placeholder"
                                    aria-hidden="true"
                                >
                                    ✦
                                </div>
                              `;


                    card.innerHTML = `

                        <div class="related-image">

                            ${imageMarkup}

                        </div>


                        <div class="related-content">

                            <span class="post-category">

                                ${escapeHTML(
                                    article.category
                                )}

                            </span>


                            <h3>

                                ${escapeHTML(
                                    article.title
                                )}

                            </h3>


                            <p>

                                ${escapeHTML(
                                    article.excerpt
                                )}

                            </p>


                            <a
                                href="article.html?slug=${encodeURIComponent(
                                    article.slug
                                )}"
                            >
                                Read article →
                            </a>

                        </div>

                    `;


                    mainContainer.appendChild(
                        card
                    );

                }
            );

        }


        /* =====================================================
           SIDEBAR RELATED ARTICLES
        ===================================================== */

        if (sidebarContainer) {

            sidebarContainer.innerHTML =
                "";


            related.forEach(
                article => {

                    const item =
                        document.createElement(
                            "a"
                        );


                    item.className =
                        "sidebar-related-item";


                    item.style.setProperty(
                        "--card-spine",
                        getCategorySpineColor(
                            article.category
                        )
                    );


                    item.href =
                        `article.html?slug=${encodeURIComponent(
                            article.slug
                        )}`;


                    item.innerHTML = `

                        <span>

                            ${escapeHTML(
                                article.category
                            )}

                        </span>

                        <strong>

                            ${escapeHTML(
                                article.title
                            )}

                        </strong>

                    `;


                    sidebarContainer.appendChild(
                        item
                    );

                }
            );

        }

    } catch (error) {

        console.error(
            "Failed to load related articles:",
            error
        );


        if (mainContainer) {

            mainContainer.innerHTML = `

                <p class="related-empty">
                    Related articles could not be loaded.
                </p>

            `;

        }


        if (sidebarContainer) {

            sidebarContainer.innerHTML = `

                <p class="related-empty">
                    Related articles unavailable.
                </p>

            `;

        }

    }

}


/* =========================================================
   EMPTY RELATED ARTICLES STATE
========================================================= */

function renderEmptyRelatedState(
    mainContainer,
    sidebarContainer
) {

    if (mainContainer) {

        mainContainer.innerHTML = `

            <p class="related-empty">
                More articles will appear here soon.
            </p>

        `;

    }


    if (sidebarContainer) {

        sidebarContainer.innerHTML = `

            <p class="related-empty">
                No related articles yet.
            </p>

        `;

    }

}


/* =========================================================
   SEO META
========================================================= */

function updateSEO(
    article
) {

    const seoTitle =
        article.seoTitle ||
        article.title;


    const description =
        article.seoDescription ||
        article.excerpt ||
        "";


    document.title =
        `${seoTitle} | MindThinkMedia`;


    /* -----------------------------------------------------
       Standard description
    ----------------------------------------------------- */

    setMeta(
        "description",
        description
    );


    /* -----------------------------------------------------
       Open Graph
    ----------------------------------------------------- */

    setMeta(
        "og:title",
        seoTitle,
        "property"
    );


    setMeta(
        "og:description",
        description,
        "property"
    );


    setMeta(
        "og:type",
        "article",
        "property"
    );


    setMeta(
        "og:url",
        window.location.href,
        "property"
    );


    if (article.image) {

        setMeta(
            "og:image",
            absoluteURL(
                article.image
            ),
            "property"
        );

    }


    /* -----------------------------------------------------
       Article metadata
    ----------------------------------------------------- */

    if (article.publishedAt) {

        setMeta(
            "article:published_time",
            new Date(
                article.publishedAt
            ).toISOString(),
            "property"
        );

    }


    if (article.updated) {

        setMeta(
            "article:modified_time",
            new Date(
                article.updated
            ).toISOString(),
            "property"
        );

    }


    /* -----------------------------------------------------
       Canonical
    ----------------------------------------------------- */

    const canonical =
        document.getElementById(
            "canonicalLink"
        );


    if (canonical) {

        canonical.href =
            createCanonicalURL(
                article.slug
            );

    }

}


/* =========================================================
   CANONICAL URL
========================================================= */

function createCanonicalURL(
    slug
) {

    const url =
        new URL(
            window.location.href
        );


    url.search =
        "";


    url.searchParams.set(
        "slug",
        slug
    );


    url.hash =
        "";


    return url.href;

}


/* =========================================================
   META HELPER
========================================================= */

function setMeta(
    name,
    content,
    attribute = "name"
) {

    if (
        content === null ||
        content === undefined
    ) {

        return;

    }


    let meta =
        document.querySelector(
            `meta[${attribute}="${name}"]`
        );


    if (!meta) {

        meta =
            document.createElement(
                "meta"
            );


        meta.setAttribute(
            attribute,
            name
        );


        document.head.appendChild(
            meta
        );

    }


    meta.setAttribute(
        "content",
        String(content)
    );

}


/* =========================================================
   STRUCTURED DATA
========================================================= */

function addStructuredData(
    article
) {

    /*
        Remove old dynamically generated schema
        if this function runs more than once.
    */

    const oldSchema =
        document.getElementById(
            "dynamicArticleSchema"
        );


    if (oldSchema) {

        oldSchema.remove();

    }


    const schema = {

        "@context":
            "https://schema.org",

        "@type":
            "BlogPosting",

        headline:
            article.title,

        description:
            article.seoDescription ||
            article.excerpt ||
            "",

        datePublished:
            article.publishedAt ||
            article.date,

        dateModified:
            article.updated ||
            article.publishedAt ||
            article.date,

        author: {

            "@type":
                "Organization",

            name:
                article.author ||
                "MindThinkMedia"

        },

        publisher: {

            "@type":
                "Organization",

            name:
                "MindThinkMedia"

        },

        mainEntityOfPage: {

            "@type":
                "WebPage",

            "@id":
                createCanonicalURL(
                    article.slug
                )

        }

    };


    if (article.image) {

        schema.image = [
            absoluteURL(
                article.image
            )
        ];

    }


    const script =
        document.createElement(
            "script"
        );


    script.id =
        "dynamicArticleSchema";


    script.type =
        "application/ld+json";


    script.textContent =
        JSON.stringify(
            schema
        );


    document.head.appendChild(
        script
    );

}


/* =========================================================
   ABSOLUTE URL
========================================================= */

function absoluteURL(
    path
) {

    try {

        return new URL(
            path,
            window.location.href
        ).href;

    } catch {

        return path;

    }

}


/* =========================================================
   ARTICLE LINKS
========================================================= */

function setupArticleLinks() {

    const links =
        document.querySelectorAll(
            ".article-content a"
        );


    links.forEach(
        link => {

            /*
                External links open safely.
            */

            if (
                link.hostname &&
                link.hostname !==
                    window.location.hostname
            ) {

                link.target =
                    "_blank";


                link.rel =
                    "noopener noreferrer";

            }

        }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(
        value
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   ARTICLE ERROR PAGE
========================================================= */

function showArticleError(
    title,
    message
) {

    const main =
        document.querySelector(
            ".article-page"
        );


    if (!main) {

        return;

    }


    /*
        Prevent broken article pages from being indexed.
    */

    setMeta(
        "robots",
        "noindex, nofollow"
    );


    document.title =
        `${title} | MindThinkMedia`;


    main.innerHTML = `

        <section class="article-error">

            <div class="container">

                <span class="article-error-icon">
                    📖
                </span>


                <h1>
                    ${escapeHTML(
                        title
                    )}
                </h1>


                <p>
                    ${escapeHTML(
                        message
                    )}
                </p>


                <a
                    href="index.html"
                    class="primary-button"
                >
                    ← Back to MindThinkMedia
                </a>

            </div>

        </section>

    `;

}