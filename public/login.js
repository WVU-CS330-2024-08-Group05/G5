const baseUrl = 'http://localhost:8080';

// logging in
console.log("logging in...");
$(function () {
    console.log("ready");

    $('#login').on('click', async function () {
        console.log("login attempt");
    
        let username = $('#username').val();
        let password = $('#password').val();
    
        let url = new URL('./logging-in.html', baseUrl);
        if (username) url.searchParams.append('username', username);
        
        console.log(`Fetching ${url.toString()}...`);
    
        // Fetch the message from the server
        fetch(url)
            .then((res) => res.text())
            .then((msg) => {
                console.log(msg);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });

});