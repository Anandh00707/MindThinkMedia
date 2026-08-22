// ============================================================
// MINDTHINKMEDIA
// ADMIN AUTHENTICATION
//
// Authentication model:
// - JWT is created by the backend.
// - JWT is stored in an HTTP-only cookie.
// - JavaScript NEVER reads or stores the JWT.
// - Browser automatically manages the authentication cookie.
// ============================================================


// ============================================================
// API CONFIGURATION
// ============================================================
//
// The backend runs on port 5000.
// The frontend may be opened using either:
//     http://localhost:5500
// or:
//     http://127.0.0.1:5500
//
// Using window.location.hostname prevents an unnecessary
// localhost / 127.0.0.1 mismatch.
// ============================================================

const API_BASE_URL =
    `${window.location.protocol}//${window.location.hostname}:5000/api`;


// ============================================================
// DOM ELEMENTS
// ============================================================

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginButtonText =
    document.getElementById("loginButtonText");

const loginSpinner =
    document.getElementById("loginSpinner");

const loginMessage =
    document.getElementById("loginMessage");

const togglePassword =
    document.getElementById("togglePassword");


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(message, type = "error") {

    loginMessage.textContent = message;

    loginMessage.className =
        `login-message ${type}`;
}


// ============================================================
// CLEAR MESSAGE
// ============================================================

function clearMessage() {

    loginMessage.textContent = "";

    loginMessage.className =
        "login-message";
}


// ============================================================
// LOADING STATE
// ============================================================

function setLoading(isLoading) {

    loginButton.disabled =
        isLoading;

    loginButtonText.textContent =
        isLoading
            ? "Signing in..."
            : "Sign In";

    loginSpinner.hidden =
        !isLoading;
}


// ============================================================
// PASSWORD VISIBILITY
// ============================================================

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            const passwordIsHidden =
                passwordInput.type === "password";

            passwordInput.type =
                passwordIsHidden
                    ? "text"
                    : "password";

            togglePassword.textContent =
                passwordIsHidden
                    ? "Hide"
                    : "Show";

            togglePassword.setAttribute(
                "aria-label",
                passwordIsHidden
                    ? "Hide password"
                    : "Show password"
            );

        }
    );

}


// ============================================================
// CHECK CURRENT ADMIN SESSION
// ============================================================
//
// We do NOT inspect the JWT.
//
// The browser automatically sends the HTTP-only cookie.
// The backend decides whether the session is valid.
//
// If authenticated:
//     redirect to dashboard.
//
// If not authenticated:
//     remain on login page.
// ============================================================

async function checkAuthentication() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/me`,
                {
                    method: "GET",

                    credentials: "include",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (response.ok) {

            window.location.replace(
                "./dashboard.html"
            );

            return;
        }


    } catch (error) {

        // This does not expose authentication details.
        // The user can still attempt to log in.

        console.warn(
            "Authentication check could not be completed."
        );

    }

}


// ============================================================
// LOGIN
// ============================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearMessage();


            // ------------------------------------------------
            // Read form values
            // ------------------------------------------------

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;


            // ------------------------------------------------
            // Validate email
            // ------------------------------------------------

            if (!email) {

                showMessage(
                    "Please enter your email address."
                );

                emailInput.focus();

                return;
            }


            // ------------------------------------------------
            // Validate email format
            // ------------------------------------------------

            if (
                !emailInput.checkValidity()
            ) {

                showMessage(
                    "Please enter a valid email address."
                );

                emailInput.focus();

                return;
            }


            // ------------------------------------------------
            // Validate password
            // ------------------------------------------------

            if (!password) {

                showMessage(
                    "Please enter your password."
                );

                passwordInput.focus();

                return;
            }


            // ------------------------------------------------
            // Loading state
            // ------------------------------------------------

            setLoading(true);


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/auth/login`,
                        {
                            method: "POST",

                            credentials: "include",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })
                        }
                    );


                // ------------------------------------------------
                // Safely parse response
                // ------------------------------------------------

                let data = null;

                try {

                    data =
                        await response.json();

                } catch (parseError) {

                    data = null;

                }


                // ------------------------------------------------
                // Login failed
                // ------------------------------------------------

                if (
                    !response.ok ||
                    !data ||
                    data.success !== true
                ) {

                    showMessage(
                        data?.message ||
                        "Login failed. Please check your credentials."
                    );

                    return;
                }


                // ------------------------------------------------
                // Login successful
                // ------------------------------------------------

                showMessage(
                    "Login successful. Redirecting...",
                    "success"
                );


                // ------------------------------------------------
                // IMPORTANT SECURITY RULE
                // ------------------------------------------------
                //
                // We intentionally do NOT:
                //
                // localStorage.setItem(...)
                // sessionStorage.setItem(...)
                // document.cookie = ...
                // const token = ...
                //
                // The backend sends the JWT as an HTTP-only
                // cookie. The browser manages it.
                //
                // ------------------------------------------------


                // Give the browser a moment to process the
                // authentication cookie before navigation.

                setTimeout(
                    () => {

                        window.location.replace(
                            "./dashboard.html"
                        );

                    },
                    200
                );

            } catch (error) {

                console.error(
                    "Login request failed:",
                    error
                );


                showMessage(
                    "Unable to connect to the server. Please make sure the backend is running."
                );

            } finally {

                setLoading(false);

            }

        }
    );

}


// ============================================================
// INITIALIZE
// ============================================================
//
// Only perform the "already logged in" redirect when this
// script is running on the login page.
//
// Protected admin pages perform their own authentication check.
// ============================================================

if (loginForm) {
    checkAuthentication();
}