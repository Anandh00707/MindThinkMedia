// ============================================================
// MINDTHINKMEDIA
// ADMIN DASHBOARD
//
// Supports:
// - Admin authentication
// - Load all admin articles
// - Statistics
// - View published article
// - Edit article
// - Publish draft
// - Unpublish published article
// - Delete article
// - Logout
// ============================================================


const API_BASE_URL =
    `${window.location.protocol}//${window.location.hostname}:5000/api`;


// ============================================================
// DOM ELEMENTS
// ============================================================

const adminEmail =
    document.getElementById("adminEmail");

const logoutButton =
    document.getElementById("logoutButton");

const dashboardMessage =
    document.getElementById("dashboardMessage");

const totalArticles =
    document.getElementById("totalArticles");

const publishedArticles =
    document.getElementById("publishedArticles");

const draftArticles =
    document.getElementById("draftArticles");

const unpublishedArticles =
    document.getElementById("unpublishedArticles");

const articlesTableBody =
    document.getElementById("articlesTableBody");


// ============================================================
// DASHBOARD STATE
// ============================================================

let currentArticles = [];


// ============================================================
// MESSAGE
// ============================================================

function showDashboardMessage(
    message,
    type = "error"
) {

    if (!dashboardMessage) {
        return;
    }

    dashboardMessage.textContent =
        message;

    dashboardMessage.className =
        `dashboard-message ${type}`;
}


// ============================================================
// CLEAR MESSAGE
// ============================================================

function clearDashboardMessage() {

    if (!dashboardMessage) {
        return;
    }

    dashboardMessage.textContent = "";

    dashboardMessage.className =
        "dashboard-message";
}


// ============================================================
// API REQUEST HELPER
// ============================================================

async function apiRequest(
    endpoint,
    options = {}
) {

    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,

                credentials:
                    "include",

                headers: {
                    Accept:
                        "application/json",

                    ...(
                        options.body
                            ? {
                                "Content-Type":
                                    "application/json"
                            }
                            : {}
                    ),

                    ...(options.headers || {})
                }
            }
        );


    let data = null;

    try {

        data =
            await response.json();

    } catch (error) {

        data = null;
    }


    return {
        response,
        data
    };
}


// ============================================================
// AUTHENTICATION FAILURE
// ============================================================

function handleAuthenticationFailure(
    response
) {

    if (
        response.status === 401 ||
        response.status === 403
    ) {

        window.location.replace(
            "./login.html"
        );

        return true;
    }

    return false;
}


// ============================================================
// CHECK ADMIN AUTHENTICATION
// ============================================================

async function checkAuthentication() {

    try {

        const {
            response,
            data
        } =
            await apiRequest(
                "/auth/me"
            );


        if (
            !response.ok ||
            !data ||
            data.success !== true ||
            !data.admin
        ) {

            window.location.replace(
                "./login.html"
            );

            return null;
        }


        return data.admin;

    } catch (error) {

        console.error(
            "Authentication check failed:",
            error
        );

        window.location.replace(
            "./login.html"
        );

        return null;
    }
}


// ============================================================
// DISPLAY ADMIN
// ============================================================

function displayAdmin(
    admin
) {

    if (
        !adminEmail ||
        !admin
    ) {

        return;
    }


    adminEmail.textContent =
        admin.email ||
        "Administrator";
}


// ============================================================
// LOAD ALL ADMIN ARTICLES
// ============================================================

async function loadArticles() {

    try {

        clearDashboardMessage();


        if (articlesTableBody) {

            articlesTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        class="table-loading"
                    >
                        Loading articles...
                    </td>
                </tr>
            `;
        }


        /*
            IMPORTANT:

            Admin dashboard must use /articles/admin.

            /articles is PUBLIC and only returns
            published articles.
        */

        const {
            response,
            data
        } =
            await apiRequest(
                "/articles/admin"
            );


        if (
            handleAuthenticationFailure(
                response
            )
        ) {

            return;
        }


        if (
            !response.ok ||
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data?.message ||
                "Failed to load articles."
            );
        }


        const articles =
            Array.isArray(
                data.articles
            )
                ? data.articles
                : [];


        currentArticles =
            articles;


        updateStatistics(
            articles
        );


        renderArticles(
            articles
        );

    } catch (error) {

        console.error(
            "Load articles error:",
            error
        );


        showDashboardMessage(
            "Unable to load articles.",
            "error"
        );


        if (articlesTableBody) {

            articlesTableBody.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        class="table-empty"
                    >
                        Unable to load articles.
                    </td>
                </tr>
            `;
        }
    }
}


// ============================================================
// UPDATE STATISTICS
// ============================================================

function updateStatistics(
    articles
) {

    const total =
        articles.length;


    const published =
        articles.filter(
            article =>
                normalizeStatus(
                    article.status
                ) === "published"
        ).length;


    const drafts =
        articles.filter(
            article =>
                normalizeStatus(
                    article.status
                ) === "draft"
        ).length;


    /*
        Current backend uses only:

        draft
        published

        Unpublish converts published -> draft.

        Therefore there is currently no separate
        "unpublished" database status.
    */

    const unpublished =
        articles.filter(
            article =>
                normalizeStatus(
                    article.status
                ) === "unpublished"
        ).length;


    if (totalArticles) {
        totalArticles.textContent =
            total;
    }

    if (publishedArticles) {
        publishedArticles.textContent =
            published;
    }

    if (draftArticles) {
        draftArticles.textContent =
            drafts;
    }

    if (unpublishedArticles) {
        unpublishedArticles.textContent =
            unpublished;
    }
}


// ============================================================
// NORMALIZE STATUS
// ============================================================

function normalizeStatus(
    status
) {

    return String(
        status || ""
    )
        .trim()
        .toLowerCase();
}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "—";
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

        return "—";
    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"
        }
    );
}


// ============================================================
// STATUS CLASS
// ============================================================

function getStatusClass(
    status
) {

    const normalized =
        normalizeStatus(
            status
        );


    if (
        normalized === "published"
    ) {

        return "status-published";
    }


    if (
        normalized === "draft"
    ) {

        return "status-draft";
    }


    if (
        normalized === "unpublished"
    ) {

        return "status-unpublished";
    }


    return "status-default";
}


// ============================================================
// RENDER ARTICLES
// ============================================================

function renderArticles(
    articles
) {

    if (!articlesTableBody) {

        return;
    }


    if (!articles.length) {

        articlesTableBody.innerHTML = `
            <tr>

                <td
                    colspan="5"
                    class="table-empty"
                >

                    No articles yet.

                    <a href="./article-editor.html">
                        Create your first article.
                    </a>

                </td>

            </tr>
        `;

        return;
    }


    articlesTableBody.innerHTML =
        articles
            .map(
                article => {

                    const status =
                        normalizeStatus(
                            article.status ||
                            "draft"
                        );


                    const title =
                        escapeHtml(
                            article.title ||
                            "Untitled"
                        );


                    const category =
                        escapeHtml(
                            article.category ||
                            "Uncategorized"
                        );


                    const safeStatus =
                        escapeHtml(
                            status
                        );


                    const id =
                        encodeURIComponent(
                            article.id
                        );


                    const slug =
                        encodeURIComponent(
                            article.slug || ""
                        );


                    const actions =
                        buildArticleActions({
                            article,
                            id,
                            slug,
                            status
                        });


                    return `
                        <tr>

                            <td>

                                <div class="article-title-cell">

                                    <strong>
                                        ${title}
                                    </strong>

                                    <small>
                                        ID: ${escapeHtml(
                                            article.id
                                        )}
                                    </small>

                                </div>

                            </td>


                            <td>
                                ${category}
                            </td>


                            <td>

                                <span
                                    class="
                                        article-status
                                        ${getStatusClass(
                                            status
                                        )}
                                    "
                                >
                                    ${safeStatus}
                                </span>

                            </td>


                            <td>

                                ${formatDate(
                                    article.updated_at ||
                                    article.created_at
                                )}

                            </td>


                            <td>

                                <div class="article-actions">

                                    ${actions}

                                </div>

                            </td>

                        </tr>
                    `;

                }
            )
            .join("");
}


// ============================================================
// BUILD ARTICLE ACTIONS
// ============================================================

function buildArticleActions({
    article,
    id,
    slug,
    status
}) {

    const actions = [];


    /*
        VIEW

        Only published articles should have a
        public View link.
    */

    if (
        status === "published" &&
        article.slug
    ) {

        actions.push(`
            <a
                href="../article.html?slug=${slug}"
                class="table-action view-action"
                target="_blank"
                rel="noopener noreferrer"
            >
                View
            </a>
        `);
    }


    /*
        EDIT
    */

    actions.push(`
        <a
            href="./article-editor.html?id=${id}"
            class="table-action edit-action"
        >
            Edit
        </a>
    `);


    /*
        PUBLISH / UNPUBLISH
    */

    if (
        status === "published"
    ) {

        actions.push(`
            <button
                type="button"
                class="
                    table-action
                    action-button
                    unpublish-action
                "
                data-action="unpublish"
                data-id="${id}"
            >
                Unpublish
            </button>
        `);

    } else {

        actions.push(`
            <button
                type="button"
                class="
                    table-action
                    action-button
                    publish-action
                "
                data-action="publish"
                data-id="${id}"
            >
                Publish
            </button>
        `);
    }


    /*
        DELETE
    */

    actions.push(`
        <button
            type="button"
            class="
                table-action
                action-button
                delete-action
            "
            data-action="delete"
            data-id="${id}"
            data-title="${escapeHtmlAttribute(
                article.title ||
                "this article"
            )}"
        >
            Delete
        </button>
    `);


    return actions.join("");
}


// ============================================================
// ARTICLE ACTION CLICK HANDLER
// ============================================================

async function handleArticleAction(
    event
) {

    const button =
        event.target.closest(
            "[data-action][data-id]"
        );


    if (!button) {

        return;
    }


    const action =
        button.dataset.action;


    const articleId =
        button.dataset.id;


    if (
        !action ||
        !articleId
    ) {

        return;
    }


    if (
        action === "publish"
    ) {

        await publishArticle(
            articleId,
            button
        );

        return;
    }


    if (
        action === "unpublish"
    ) {

        await unpublishArticle(
            articleId,
            button
        );

        return;
    }


    if (
        action === "delete"
    ) {

        const title =
            button.dataset.title ||
            "this article";


        await deleteArticle(
            articleId,
            title,
            button
        );
    }
}


// ============================================================
// PUBLISH ARTICLE
// ============================================================

async function publishArticle(
    articleId,
    button
) {

    clearDashboardMessage();


    setActionButtonLoading(
        button,
        true,
        "Publishing..."
    );


    try {

        const {
            response,
            data
        } =
            await apiRequest(
                `/articles/${encodeURIComponent(
                    articleId
                )}/publish`,
                {
                    method:
                        "PATCH"
                }
            );


        if (
            handleAuthenticationFailure(
                response
            )
        ) {

            return;
        }


        if (
            !response.ok ||
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data?.message ||
                "Failed to publish article."
            );
        }


        showDashboardMessage(
            "Article published successfully.",
            "success"
        );


        await loadArticles();

    } catch (error) {

        console.error(
            "Publish article error:",
            error
        );


        showDashboardMessage(
            error.message ||
            "Unable to publish article.",
            "error"
        );

    } finally {

        setActionButtonLoading(
            button,
            false
        );
    }
}


// ============================================================
// UNPUBLISH ARTICLE
// ============================================================

async function unpublishArticle(
    articleId,
    button
) {

    clearDashboardMessage();


    const confirmed =
        window.confirm(
            "Unpublish this article?\n\nIt will no longer be visible on the public website and will return to Draft status."
        );


    if (!confirmed) {

        return;
    }


    setActionButtonLoading(
        button,
        true,
        "Unpublishing..."
    );


    try {

        const {
            response,
            data
        } =
            await apiRequest(
                `/articles/${encodeURIComponent(
                    articleId
                )}/unpublish`,
                {
                    method:
                        "PATCH"
                }
            );


        if (
            handleAuthenticationFailure(
                response
            )
        ) {

            return;
        }


        if (
            !response.ok ||
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data?.message ||
                "Failed to unpublish article."
            );
        }


        showDashboardMessage(
            "Article unpublished and moved to Draft.",
            "success"
        );


        await loadArticles();

    } catch (error) {

        console.error(
            "Unpublish article error:",
            error
        );


        showDashboardMessage(
            error.message ||
            "Unable to unpublish article.",
            "error"
        );

    } finally {

        setActionButtonLoading(
            button,
            false
        );
    }
}


// ============================================================
// DELETE ARTICLE
// ============================================================

async function deleteArticle(
    articleId,
    articleTitle,
    button
) {

    clearDashboardMessage();


    const confirmed =
        window.confirm(
            `Delete "${articleTitle}"?\n\nThis will permanently remove the article from PostgreSQL. This action cannot be undone.`
        );


    if (!confirmed) {

        return;
    }


    setActionButtonLoading(
        button,
        true,
        "Deleting..."
    );


    try {

        const {
            response,
            data
        } =
            await apiRequest(
                `/articles/${encodeURIComponent(
                    articleId
                )}`,
                {
                    method:
                        "DELETE"
                }
            );


        if (
            handleAuthenticationFailure(
                response
            )
        ) {

            return;
        }


        if (
            !response.ok ||
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data?.message ||
                "Failed to delete article."
            );
        }


        showDashboardMessage(
            "Article deleted successfully.",
            "success"
        );


        await loadArticles();

    } catch (error) {

        console.error(
            "Delete article error:",
            error
        );


        showDashboardMessage(
            error.message ||
            "Unable to delete article.",
            "error"
        );

    } finally {

        setActionButtonLoading(
            button,
            false
        );
    }
}


// ============================================================
// ACTION BUTTON LOADING STATE
// ============================================================

function setActionButtonLoading(
    button,
    loading,
    loadingText = ""
) {

    if (!button) {

        return;
    }


    if (loading) {

        button.dataset.originalText =
            button.textContent.trim();


        button.disabled =
            true;


        if (loadingText) {

            button.textContent =
                loadingText;
        }

        return;
    }


    button.disabled =
        false;


    if (
        button.dataset.originalText
    ) {

        button.textContent =
            button.dataset.originalText;

        delete button.dataset.originalText;
    }
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ============================================================
// ESCAPE HTML ATTRIBUTE
// ============================================================

function escapeHtmlAttribute(
    value
) {

    return escapeHtml(
        value
    );
}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    if (!logoutButton) {

        return;
    }


    logoutButton.disabled =
        true;


    logoutButton.textContent =
        "Logging out...";


    try {

        const {
            response,
            data
        } =
            await apiRequest(
                "/auth/logout",
                {
                    method:
                        "POST"
                }
            );


        if (
            !response.ok ||
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data?.message ||
                "Logout failed."
            );
        }


        window.location.replace(
            "./login.html"
        );

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        showDashboardMessage(
            "Unable to log out. Please try again.",
            "error"
        );


        logoutButton.disabled =
            false;


        logoutButton.textContent =
            "Logout";
    }
}


// ============================================================
// EVENT LISTENERS
// ============================================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logout
    );
}


if (articlesTableBody) {

    /*
        Event delegation allows buttons created dynamically
        by renderArticles() to work without attaching a new
        listener to every row.
    */

    articlesTableBody.addEventListener(
        "click",
        handleArticleAction
    );
}


// ============================================================
// INITIALIZE DASHBOARD
// ============================================================

async function initializeDashboard() {

    clearDashboardMessage();


    const admin =
        await checkAuthentication();


    if (!admin) {

        return;
    }


    displayAdmin(
        admin
    );


    await loadArticles();
}


// ============================================================
// START
// ============================================================

initializeDashboard();