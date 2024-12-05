const baseUrl = 'https://cs330-5-webapp-eqbjb0c6f2hfbxft.canadacentral-01.azurewebsites.net';

// logging in
console.log("logging in...");
$(function () {
    console.log("ready");

    async function performLogin() {
        console.log("login attempt");
    
        // Gather user inputs
        let username = $('#username').val();
        let password = $('#password').val();
    
        // input error messages
        let usernameErrorDiv = $('#username-error');
        let passwordErrorDiv = $('#password-error');

        // Clear previous error messages
        usernameErrorDiv.html("");
        passwordErrorDiv.html("");

        // Define the URL for the POST request
        let url = `${baseUrl}/login`;
    
        // Only send the request if username is provided
        if (username && password) {
            console.log(`Posting to ${url}...`);
    
            // Make a POST request with the username in the request body
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username, password: password })
            })
            .then((res) => res.text())
            .then((msg) => {
                if (msg === "Username not found") {
                    usernameErrorDiv.html("User does not exist, or username is incorrect.");
                } 
                if (msg === "Password is incorrect") {
                    passwordErrorDiv.html("Password is incorrect.");
                }
                if (msg === "Password is correct") {
                    // Update the DOM first
                    usernameErrorDiv.html(""); 
                    passwordErrorDiv.html("");
                    
                    // Update sessionStorage to indicate a logged-in user (not a guest)
                    sessionStorage.setItem("isGuest", "false");

                    sessionStorage.setItem("username", username);
    
                    // Now redirect after the DOM is updated
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 100); // Delay redirection slightly to ensure the DOM is updated
                }

            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    }
    // Logs in when login button clicked
    $('#login').on('click', performLogin);
    // Logs in when enter button is clicked
    $('#username, #password').on('keypress', function (e) {
        if (e.which === 13) {
            e.preventDefault();
            performLogin();
        }
    })
});