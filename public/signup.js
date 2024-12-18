/**
 * Handles user signup functionality:
 * - Validates user inputs (email, password strength).
 * - Checks if the username is available.
 * - Updates session storage and redirects on successful signup.
 */

const baseUrl = 'http://localhost:8080'; // Base URL for the API

$(function () {
    /**
     * Performs signup by validating user inputs, checking username availability, and handling user account creation.
     */
    async function performSignup() {
        // Gather user inputs
        let username = $('#username').val();
        let password = $('#password').val();
        let email = $('#email').val();

        // Error display elements
        let emailErrorDiv = $('#email-error');
        let passwordErrorDiv = $('#password-error');
        let usernameErrorDiv = $('#username-error');

        // Clear previous error messages
        emailErrorDiv.html("");
        passwordErrorDiv.html("");
        usernameErrorDiv.html("");

        // Validate email and password
        let emailResult = isEmail(email);
        let passwordErrorMessage = isStrongPassword(password);

        let hasError = false;

        // Display email error if invalid
        if (emailResult) {
            emailErrorDiv.html(emailResult);
            hasError = true;
        }

        // Display password error if invalid
        if (passwordErrorMessage) {
            passwordErrorDiv.html(passwordErrorMessage);
            hasError = true;
        }

        // Proceed only if there are no validation errors
        if (!hasError) {
            const usernameAvailable = await usernameExists(username, password, email);
            if (usernameAvailable) {
                // Update session storage to reflect logged-in state
                sessionStorage.setItem("isGuest", "false");
                sessionStorage.setItem("username", username);

                // Redirect to the homepage after a short delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 100); // Ensure DOM is updated before redirection
            }
        }
    }

    // Event listener for the signup button
    $('#signup').on('click', performSignup);

    // Event listener for the "Enter" key within input fields
    $('#password, #username, #email').on('keypress', function (e) {
        if (e.which === 13) { // Enter key code is 13
            e.preventDefault();
            performSignup();
        }
    });
});

/**
 * Validates the strength of a password.
 * 
 * @param {string} password - The password to validate.
 * @returns {string} - An error message if the password is weak, or an empty string if valid.
 */
function isStrongPassword(password) {
    let error = "";
    if (password.length < 8) {
        error += "Password needs to be more than 8 characters.<br>";
    }
    if (!/[A-Z]/.test(password)) {
        error += "Password needs to have a capital letter.<br>";
    }
    return error;
}

/**
 * Validates the format of an email address.
 * 
 * @param {string} email - The email address to validate.
 * @returns {string} - An error message if the email is invalid, or an empty string if valid.
 */
function isEmail(email) {
    let error = "";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        error += "Must be a valid email.<br>";
    }
    return error;
}

/**
 * Checks if a username is available by sending a POST request to the server.
 * 
 * @param {string} username - The username to check.
 * @param {string} password - The password for the account.
 * @param {string} email - The email for the account.
 * @returns {Promise<boolean>} - Resolves true if the username is available, false if taken.
 */
function usernameExists(username, password, email) {
    return new Promise((resolve, reject) => {
        let usernameErrorDiv = $('#username-error');
        usernameErrorDiv.html(""); // Clear previous error messages

        let url = `${baseUrl}/signing-up`;

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username, password: password, email: email }),
        })
            .then((res) => res.text())
            .then((msg) => {
                if (msg === "Username taken") {
                    usernameErrorDiv.html("Username is taken. Please pick another.");
                    resolve(false); // Username is taken
                } else {
                    resolve(true); // Username is available
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                reject(error); // Handle fetch errors
            });
    });
}
