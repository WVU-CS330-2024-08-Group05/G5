const baseUrl = 'http://localhost:8080';


$(function () {
    $('#signup').on('click', async function () {
        let username = $('#username').val();
        let password = $('#password').val();
        let email = $('#email').val();

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

        // Check if username is taken
        if (!hasError) {
            const usernameAvailable = await usernameExists(username, password, email);
            if (usernameAvailable) {
                
                // Update sessionStorage to indicate a logged-in user (not a guest)
                sessionStorage.setItem("isGuest", "false");

                sessionStorage.setItem("username", username);
                
                // Update the DOM and redirect
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 100);
            }
        }
    });
});


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

function isEmail(email) {
    let error = "";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        error += "Must be a valid email.<br>";
    }
    return error;
}

function usernameExists(username, password, email) {
    return new Promise((resolve, reject) => {
        let usernameErrorDiv = $('#username-error');
        usernameErrorDiv.html(""); // Clear previous error messages

        let url = `${baseUrl}/signing-up.html`;
        
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, password: password, email: email })
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
