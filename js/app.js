/* =========================================================
   MINDTHINKMEDIA
   GLOBAL WEBSITE JAVASCRIPT

   This file controls:
   - Article rendering
   - Article search
   - Category filtering
   - Mobile navigation
   - Scroll reveal
   - Contact form
========================================================= */


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


/* =====================================================
   PREMIUM PAGE ENTRANCE
===================================================== */

requestAnimationFrame(() => {

    document.body.classList.add(
        "page-ready"
    );

});


    /* =========================================================
       HOMEPAGE ARTICLE API
    ========================================================= */

    const BACKEND_ORIGIN =
        `${window.location.protocol}//${window.location.hostname}:5000`;

    const ARTICLES_API_URL =
        `${BACKEND_ORIGIN}/api/articles`;

    /* =====================================================
       ELEMENTS
    ====================================================== */

    const menuButton =
        document.getElementById("menuButton");

    const mobileMenu =
        document.getElementById("mobileMenu");

    const searchButton =
        document.getElementById("searchButton");

    const searchSection =
        document.getElementById("searchSection");

    const searchInput =
        document.getElementById("searchInput");

    const articlesGrid =
        document.getElementById("articlesGrid");

    const featuredArticleCard =
        document.getElementById("featuredArticleCard");

    const noResults =
        document.getElementById("noResults");

    const searchMessage =
        document.getElementById("searchMessage");

    const clearSearch =
        document.getElementById("clearSearch");

    /* =====================================================
      HOMEPAGE ARTICLE STATE
      ===================================================== */
    
     let homepageArticles = [];


    /* =====================================================
       MOBILE MENU
       
       Your current HTML does not contain #mobileMenu,
       so this safely does nothing until you add one.
    ====================================================== */

    if (menuButton && mobileMenu) {

        menuButton.addEventListener("click", () => {

            const isOpen =
                mobileMenu.classList.toggle("open");

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        });

    }


    /* =====================================================
       MOBILE BOTTOM NAVIGATION
    ====================================================== */

    const mobileNavItems =
        document.querySelectorAll(".mobile-nav-item");


    mobileNavItems.forEach(item => {

        item.addEventListener("click", () => {

            mobileNavItems.forEach(navItem => {

                navItem.classList.remove("active");

            });


            item.classList.add("active");


            if (mobileMenu) {

                mobileMenu.classList.remove("open");

            }


            if (menuButton) {

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        });

    });


    /* =====================================================
       MOBILE NAV — ACTIVE SECTION ON SCROLL
    ====================================================== */

    const mobileSections = [

        {
            id: "top",
            nav: document.querySelector(
                '.mobile-nav-item[data-section="top"]'
            )
        },

        {
            id: "latest",
            nav: document.querySelector(
                '.mobile-nav-item[data-section="latest"]'
            )
        },

        {
            id: "categories",
            nav: document.querySelector(
                '.mobile-nav-item[data-section="categories"]'
            )
        },

        {
            id: "about",
            nav: document.querySelector(
                '.mobile-nav-item[data-section="about"]'
            )
        },

        {
            id: "contact",
            nav: document.querySelector(
                '.mobile-nav-item[data-section="contact"]'
            )
        }

    ];


    if ("IntersectionObserver" in window) {

        const mobileSectionObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (!entry.isIntersecting) {
                            return;
                        }


                        const activeSection =
                            mobileSections.find(
                                section =>
                                    section.id ===
                                    entry.target.id
                            );


                        if (!activeSection) {
                            return;
                        }


                        mobileNavItems.forEach(item => {

                            item.classList.remove(
                                "active"
                            );

                        });


                        if (activeSection.nav) {

                            activeSection.nav.classList.add(
                                "active"
                            );

                        }

                    });

                },
                {
                    rootMargin:
                        "-25% 0px -60% 0px",

                    threshold: 0
                }
            );


        mobileSections.forEach(section => {

            const element =
                document.getElementById(section.id);


            if (element) {

                mobileSectionObserver.observe(
                    element
                );

            }

        });

    }


    /* =====================================================
       SEARCH BUTTON
    ====================================================== */

    if (
        searchButton &&
        searchSection &&
        searchInput
    ) {

        searchButton.addEventListener(
            "click",
            () => {

                searchSection.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });


                setTimeout(() => {

                    searchInput.focus();

                }, 500);

            }
        );

    }

    /* =========================================================
  API ARTICLE HELPERS
========================================================= */

    function resolveHomepageImageUrl(imagePath) {

        if (!imagePath) {
            return "";
        }

        const path =
            String(imagePath).trim();


        if (!path) {
            return "";
        }


        if (
            path.startsWith("http://") ||
            path.startsWith("https://") ||
            path.startsWith("data:")
        ) {

            return path;
        }


        if (path.startsWith("/")) {

            return `${BACKEND_ORIGIN}${path}`;
        }


        return `${BACKEND_ORIGIN}/${path}`;
    }


    /* =========================================================
       FORMAT ARTICLE DATE
    ========================================================= */

    function formatHomepageDate(value) {

        if (!value) {
            return "";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value);
        }


        return date.toLocaleDateString(
            "en-US",
            {
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );
    }


    /* =========================================================
       CALCULATE READING TIME
    ========================================================= */

    function calculateHomepageReadTime(content) {

        if (!content) {
            return "1 min read";
        }


        const plainText =
            String(content)
                .replace(
                    /<[^>]*>/g,
                    " "
                )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


        const words =
            plainText
                ? plainText.split(/\s+/).length
                : 0;


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
       NORMALIZE DATABASE ARTICLE
    
       Converts PostgreSQL/API fields into the format that the
       existing homepage card renderer already understands.
    ========================================================= */

    function normalizeHomepageArticle(article) {

        if (!article) {
            return null;
        }


        return {

            id:
                article.id,

            slug:
                article.slug || "",

            title:
                article.title || "Untitled Article",

            category:
                article.category || "General",

            excerpt:
                article.excerpt || "",

            image:
                resolveHomepageImageUrl(
                    article.featured_image ||
                    article.image ||
                    ""
                ),

            imageAlt:
                article.image_alt ||
                article.imageAlt ||
                article.title ||
                "Article image",

            date:
                formatHomepageDate(
                    article.published_at ||
                    article.created_at
                ),

            readTime:
                article.read_time ||
                article.readTime ||
                calculateHomepageReadTime(
                    article.content
                ),

            featured:
                Boolean(
                    article.featured ||
                    article.is_featured
                ),

            content:
                article.content || ""

        };
    }

    /* =========================================================
RENDER FEATURED ARTICLE
========================================================= */

    function renderFeaturedArticle(article) {

        if (!featuredArticleCard) {
            return;
        }


        if (!article) {

            featuredArticleCard.innerHTML = "";
            featuredArticleCard.style.display = "none";

            return;
        }


        let imageHTML = "";


        if (article.image) {

            imageHTML = `
            <img
                src="${article.image}"
                alt="${article.imageAlt || article.title}"
                loading="eager"
                style="
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                "
            >
        `;

        } else {

            imageHTML = `
            <div class="image-placeholder">

                <span>✦</span>

                <p>
                    ${article.category}
                </p>

            </div>
        `;

        }


        const articleUrl =
            article.slug
                ? `article.html?slug=${encodeURIComponent(article.slug)}`
                : `article.html?id=${encodeURIComponent(article.id)}`;


        featuredArticleCard.innerHTML = `

        <div class="featured-image">

            ${imageHTML}

        </div>


        <div class="featured-content">

            <span class="post-category">
                ${article.category}
            </span>


            <h3>
                ${article.title}
            </h3>


            <p>
                ${article.excerpt}
            </p>


            <div class="post-meta">

                <span>
                    ${article.date}
                </span>

                <span>
                    •
                </span>

                <span>
                    ${article.readTime}
                </span>

            </div>


            <a
                href="${articleUrl}"
                class="read-button"
                aria-label="Read ${article.title}"
            >

                Read the article

                <span>→</span>

            </a>

        </div>
    `;


        featuredArticleCard.style.display = "";
    }


    /* =========================================================
       FETCH PUBLISHED ARTICLES
    ========================================================= */

    async function fetchHomepageArticles() {

        const response =
            await fetch(
                ARTICLES_API_URL,
                {
                    method: "GET",
                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch (error) {

            throw new Error(
                "The article API returned invalid JSON."
            );
        }


        if (!response.ok) {

            throw new Error(
                data?.message ||
                "Could not load published articles."
            );
        }


        /*
            Supports either:
    
            [ ...articles ]
    
            OR
    
            {
                success: true,
                articles: [...]
            }
        */

        const rawArticles =
            Array.isArray(data)
                ? data
                : Array.isArray(data?.articles)
                    ? data.articles
                    : [];


        return rawArticles
            .map(
                normalizeHomepageArticle
            )
            .filter(Boolean);
    }


    /* =====================================================
       ARTICLE CARD
    ====================================================== */

    function createArticleCard(article) {

        const card =
            document.createElement("article");


        card.className =
            "article-card reveal";


        card.dataset.category =
            article.category;


        card.dataset.title =
            article.title;


        /* ---------------------------------------------
           IMAGE
        --------------------------------------------- */

        let imageHTML = "";


        if (article.image) {

            imageHTML = `

                <img
                    src="${article.image}"
                    alt="${article.imageAlt || article.title}"
                    loading="lazy"
                >

            `;

        } else {

            imageHTML = `

                <div class="article-image-placeholder">
                    <span>✦</span>
                </div>

            `;

        }


        /* ---------------------------------------------
           CARD HTML
        --------------------------------------------- */

        card.innerHTML = `

            <div class="article-image">

                ${imageHTML}

            </div>


            <div class="article-card-content">

                <span class="post-category">

                    ${article.category}

                </span>


                <h3>

                    ${article.title}

                </h3>


                <p>

                    ${article.excerpt}

                </p>


                <div class="post-meta">

                    <span>
                        ${article.date}
                    </span>

                    <span>
                        •
                    </span>

                    <span>
                        ${article.readTime}
                    </span>

                </div>


                <a
                   href="${article.slug
                ? `article.html?slug=${encodeURIComponent(article.slug)}`
                : `article.html?id=${encodeURIComponent(article.id)}`
            }"
                     class="read-button"
                    aria-label="Read ${article.title}"
                    >
                         Read article →
                </a>
            </div>

        `;


        return card;

    }


    /* =====================================================
       RENDER ARTICLES
    ====================================================== */

    function renderArticles(articleList) {

        if (!articlesGrid) {

            console.error(
                "MindThinkMedia: #articlesGrid was not found."
            );

            return;

        }


        articlesGrid.innerHTML = "";


        /* ---------------------------------------------
           EMPTY STATE
        --------------------------------------------- */

        if (!articleList || articleList.length === 0) {

            if (noResults) {

                noResults.style.display = "block";

            }

            return;

        }


        if (noResults) {

            noResults.style.display = "none";

        }


        /* ---------------------------------------------
           CREATE CARDS
        --------------------------------------------- */

        articleList.forEach(article => {

            const card =
                createArticleCard(article);


            articlesGrid.appendChild(card);

        });


        /* ---------------------------------------------
           SCROLL REVEAL FOR NEW CARDS
        --------------------------------------------- */

        setupRevealAnimation(
            articlesGrid.querySelectorAll(".reveal")
        );

    }


    /* =====================================================
       SCROLL REVEAL
    ====================================================== */

    function setupRevealAnimation(elements) {

        if (
            !elements ||
            !elements.length
        ) {
            return;
        }


        if (!("IntersectionObserver" in window)) {

            elements.forEach(element => {

                element.classList.add("visible");

            });

            return;

        }


        const revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );


                            revealObserver.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.15
                }
            );


        elements.forEach(element => {

            revealObserver.observe(element);

        });

    }

    /* =====================================================
   INITIAL HOMEPAGE ARTICLE RENDERING

   Source:
   PostgreSQL → GET /api/articles
===================================================== */

async function loadHomepageArticles() {

    if (!articlesGrid) {
        return;
    }

    try {

        // 1. Load published articles from PostgreSQL/API
        const apiArticles =
            await fetchHomepageArticles();

        console.log(
            "MindThinkMedia API articles loaded:",
            apiArticles.length
        );

        homepageArticles = apiArticles;


        // 2. Stop cleanly if database has no published articles
        if (apiArticles.length === 0) {

            renderFeaturedArticle(null);
            renderArticles([]);

            console.warn(
                "MindThinkMedia: No published articles found."
            );

            return;
        }


        // 3. Choose featured article
        // If no article is explicitly featured,
        // use the newest/first API article.
        const featuredArticle =
            apiArticles.find(
                article => article.featured === true
            ) ||
            apiArticles[0];


        // 4. Render Featured section
        renderFeaturedArticle(
            featuredArticle
        );


        // 5. Latest articles
        // Do not repeat Featured article.
        const latestArticles =
            apiArticles.filter(
                article =>
                    article.id !== featuredArticle.id
            );


        // 6. Render Latest section
        renderArticles(
            latestArticles
        );


    } catch (error) {

        console.error(
            "MindThinkMedia homepage API error:",
            error
        );

        homepageArticles = [];

        renderFeaturedArticle(null);
        renderArticles([]);
    }
}


loadHomepageArticles(); 


    /* =====================================================
       ARTICLE SEARCH
    ====================================================== */

    if (
        searchInput &&
        articlesGrid
    ) {

        searchInput.addEventListener(
    "input",
    () => {

        const query =
            searchInput.value
                .toLowerCase()
                .trim();


        /* =============================================
           SEARCH POSTGRESQL / API ARTICLES
        ============================================= */

        let results = [];


        if (!query) {

            /*
                Empty search:
                show all published API articles.
            */

            results =
                homepageArticles;

        } else {

            results =
                homepageArticles.filter(
                    article => {

                        const title =
                            String(
                                article.title || ""
                            ).toLowerCase();


                        const excerpt =
                            String(
                                article.excerpt || ""
                            ).toLowerCase();


                        const category =
                            String(
                                article.category || ""
                            ).toLowerCase();


                        return (
                            title.includes(query) ||
                            excerpt.includes(query) ||
                            category.includes(query)
                        );

                    }
                );

        }


        renderArticles(
            results
        );

                /* -------------------------------------
                   CLEAR BUTTON
                ------------------------------------- */

                if (clearSearch) {

                    clearSearch.style.display =
                        query.length > 0
                            ? "block"
                            : "none";

                }


                /* -------------------------------------
                   SEARCH MESSAGE
                ------------------------------------- */

                if (searchMessage) {

                    if (query.length > 0) {

                        searchMessage.textContent =
                            `${results.length} article${results.length === 1 ? "" : "s"} found`;

                    } else {

                        searchMessage.textContent =
                            "";

                    }

                }


                /* -------------------------------------
                   NO RESULTS
                ------------------------------------- */

                if (noResults) {

                    noResults.style.display =
                        query.length > 0 &&
                            results.length === 0
                            ? "block"
                            : "none";

                }

            }
        );


        /* ---------------------------------------------
           CLEAR SEARCH
        --------------------------------------------- */

        if (clearSearch) {

            clearSearch.style.display = "none";


            clearSearch.addEventListener(
                "click",
                () => {

                    searchInput.value = "";

                    searchInput.dispatchEvent(
                        new Event("input")
                    );

                    searchInput.focus();

                }
            );

        }

    }


    /* =====================================================
       CATEGORY FILTER
    ====================================================== */

    const categoryButtons =
        document.querySelectorAll(
            ".category-card"
        );


    if (
        categoryButtons.length &&
        searchInput
    ) {

        categoryButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const category =
                        button.dataset.category;


                    searchInput.value =
                        category;


                    searchInput.dispatchEvent(
                        new Event("input")
                    );


                    const latest =
                        document.getElementById(
                            "latest"
                        );


                    if (latest) {

                        latest.scrollIntoView({
                            behavior: "smooth"
                        });

                    }

                }
            );

        });

    }


    /* =====================================================
       INITIAL PAGE REVEAL
    ====================================================== */

    setupRevealAnimation(
        document.querySelectorAll(".reveal")
    );


    /* =====================================================
       EMAILJS CONTACT FORM
    ====================================================== */

    const contactForm =
        document.getElementById(
            "contactForm"
        );


    const contactSubmit =
        document.getElementById(
            "contactSubmit"
        );


    const contactStatus =
        document.getElementById(
            "contactStatus"
        );


    if (contactForm) {


        /* ---------------------------------------------
           CHECK EMAILJS
        --------------------------------------------- */

        if (
            typeof emailjs ===
            "undefined"
        ) {

            console.error(
                "MindThinkMedia: EmailJS library was not loaded."
            );

            return;

        }


        /* ---------------------------------------------
           INITIALIZE EMAILJS
        --------------------------------------------- */

        emailjs.init({
            publicKey:
                "BwRGCwgSm8y3ZtGwJ"
        });


        /* ---------------------------------------------
           FORM SUBMISSION
        --------------------------------------------- */

        contactForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                if (contactSubmit) {

                    contactSubmit.disabled =
                        true;

                    contactSubmit.innerHTML =
                        "Sending...";

                }


                if (contactStatus) {

                    contactStatus.textContent =
                        "";

                    contactStatus.className =
                        "contact-status";

                }


                try {

                    await emailjs.sendForm(
                        "service_j028yzg",
                        "template_xipk1w8",
                        contactForm
                    );


                    /* SUCCESS */

                    if (contactStatus) {

                        contactStatus.textContent =
                            "Message sent successfully. Thank you for contacting us!";

                        contactStatus.classList.add(
                            "success"
                        );

                    }


                    contactForm.reset();


                } catch (error) {

                    console.error(
                        "EmailJS error:",
                        error
                    );


                    if (contactStatus) {

                        contactStatus.textContent =
                            "Something went wrong. Please try again later.";

                        contactStatus.classList.add(
                            "error"
                        );

                    }

                } finally {

                    if (contactSubmit) {

                        contactSubmit.disabled =
                            false;

                        contactSubmit.innerHTML =
                            'Send Message <span>→</span>';

                    }

                }

            }
        );

    }




});