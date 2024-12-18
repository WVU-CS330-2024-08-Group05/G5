/**
 * Handles the login functionality for a user by interacting with the server and updating the UI.
 */
$(function () {
    console.log("ready");

    /**
     * Performs the login operation by sending a POST request to the server
     * with the provided username and password.
     * 
     * - Displays error messages if login fails.
     * - Updates sessionStorage and redirects to the homepage on successful login.
     */
    async function performLogin() {
        console.log("login attempt");
    
        // Gather user inputs
        let username = $('#username').val();
        let password = $('#password').val();
    
        // Error message elements
        let usernameErrorDiv = $('#username-error');
        let passwordErrorDiv = $('#password-error');

        // Clear previous error messages
        usernameErrorDiv.html("");
        passwordErrorDiv.html("");

        // Define the URL for the POST request
        let url = `/login`;
    
        // Ensure both username and password are provided
        if (username && password) {
            console.log(`Posting to ${url}...`);
    
            // Make a POST request with the username and password
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username, password: password }),
            })
            .then((res) => res.text()) // Parse the response as plain text
            .then((msg) => {
                // Handle server responses
                if (msg === "Username not found") {
                    usernameErrorDiv.html("User does not exist, or username is incorrect.");
                } 
                if (msg === "Password is incorrect") {
                    passwordErrorDiv.html("Password is incorrect.");
                }
                if (msg === "Password is correct") {
                    // Clear error messages
                    usernameErrorDiv.html(""); 
                    passwordErrorDiv.html("");
                    
                    // Set sessionStorage values for the logged-in user
                    sessionStorage.setItem("isGuest", "false");
                    sessionStorage.setItem("username", username);
    
                    // Redirect to the homepage
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 100); // Slight delay to ensure the DOM is updated
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    }

    /**
     * Attaches the login functionality to the "Login" button click event.
     */
    $('#login').on('click', performLogin);

    /**
     * Enables login when the Enter key is pressed in the username or password fields.
     * 
     * @param {Event} e - The keypress event.
     */
    $('#username, #password').on('keypress', function (e) {
        if (e.which === 13) { // Keycode for Enter key
            e.preventDefault();
            performLogin();
        }
    });
});
