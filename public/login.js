const baseUrl = 'http://localhost:8080';

// logging in
console.log("logging in...");
$(function () {
    console.log("ready");

    $('#login').on('click', async function () {
        console.log("login attempt");
    
        // Gather user inputs
        let username = $('#username').val();
        let password = $('#password').val();
    
        // Define the URL for the POST request
        let url = `${baseUrl}/logging-in.html`;
    
        // Only send the request if username is provided
        if (username) {
            console.log(`Posting to ${url}...`);
    
            // Make a POST request with the username in the request body
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username: username })
            })
            .then((res) => res.text())
            .then((msg) => {
                console.log(msg); // Log the server's response message
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }
    });

});