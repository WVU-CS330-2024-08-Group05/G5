

console.log("getting trips...");
$(async function () {
    const username = sessionStorage.getItem("username");

    if (window.location.pathname.endsWith('account.html') || window.location.pathname === '/') {
        if (username) {
            $('#username-written').text(username);

            try {
                // Fetch trips from the server
                const trips = await Trip.getAccountTrips(username);

                if (trips && trips.length > 0) {
                    // Generate HTML for each trip and wait for all promises to resolve
                    const tripCardsHtml = await Promise.all(trips.map(trip => Trip.html(trip)));

                    // Append the resolved HTML to the 'user-locations' div and show it
                    $('#user-locations').html(tripCardsHtml.join('')).show();
                } else {
                    console.log("No trips found for this user.");
                    $('#user-locations').html('<p>No trips to display.</p>').show();
                }
            } catch (error) {
                console.error("Error loading trips:", error);
            }
        } else {
            console.log("No username found in session storage.");
        }
    }
});

// listen and act on clear trips
document.addEventListener('DOMContentLoaded', function() {
    const clearTripsButton = document.getElementById('clear-trips');
    if (clearTripsButton) {
        clearTripsButton.onclick = async function() {
            console.log("Eradicating trips");
            await Trip.clearTrips();

            window.location.reload();
        };
    } else {
        console.error('Clear Trips button not found in the DOM.');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Change Password Logic
    const changePasswordButton = document.getElementById('password-change');
    if (changePasswordButton) {
        changePasswordButton.onclick = function() {
            // Hide all other buttons
            toggleButtonsVisibility(false);

            // Hide the original button and replace it with password input, error message, submit and cancel buttons
            changePasswordButton.style.display = 'none'; // Hide the original button
            const wrapper = document.createElement('div');
            wrapper.id = "password-wrapper";
            wrapper.className = "mt-2";

            wrapper.innerHTML = `
                <input type="password" placeholder="New Password" id="password" class="form-control mb-2">
                <div id="password-error" class="error-message text-danger"></div>
                <button id="password-submit" class="btn btn-success btn-sm">Submit</button>
                <button id="password-cancel" class="btn btn-danger btn-sm ml-2">Cancel</button>
            `;

            changePasswordButton.parentNode.appendChild(wrapper);

            document.getElementById('password-submit').onclick = async function() {
                const passwordInput = document.getElementById('password').value;
                if (passwordInput.trim() === "") {
                    document.getElementById('password-error').innerText = "Password cannot be empty!";
                } else if (isStrongPassword(passwordInput).length > 0) {
                    document.getElementById('password-error').innerText = isStrongPassword(passwordInput);
                } else {
                    let url = `/change-password`
                    let username = sessionStorage.getItem("username");
                    console.log(`Fetching from ${url}`);
                    try {
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ username, password: passwordInput})
                        });
            
                        if (!response.ok) {
                            throw new Error('Failed to change password');
                        }
            
                    }  catch(err) {
                            console.error('Error changing password:', err);
                    }

                    document.getElementById('password-error').innerText = "";

                    // Hide the new fields and show the original button again
                    wrapper.remove(); // Remove the input fields and submit button
                    changePasswordButton.style.display = 'inline-block'; // Show the original button again

                    // Show all other buttons
                    toggleButtonsVisibility(true);
                }
            };

            document.getElementById('password-cancel').onclick = function() {
                // Hide the new fields and show the original button again
                wrapper.remove(); // Remove the input fields and submit button
                changePasswordButton.style.display = 'inline-block'; // Show the original button again

                // Show all other buttons
                toggleButtonsVisibility(true);
            };
        };
    } else {
        console.error('Change Password button not found.');
    }

    // Change Username Logic
    const changeUsernameButton = document.getElementById('username-change');
    if (changeUsernameButton) {
        changeUsernameButton.onclick = function() {
            console.log("Changing Username");

            // Hide all other buttons
            toggleButtonsVisibility(false);

            // Hide the original button and replace it with username input, error message, submit and cancel buttons
            changeUsernameButton.style.display = 'none'; // Hide the original button
            const wrapper = document.createElement('div');
            wrapper.id = "username-wrapper";
            wrapper.className = "mt-2";

            wrapper.innerHTML = `
                <input type="text" placeholder="New Username" id="username" class="form-control mb-2">
                <div id="username-error" class="error-message text-danger"></div>
                <button id="username-submit" class="btn btn-success btn-sm">Submit</button>
                <button id="username-cancel" class="btn btn-danger btn-sm ml-2">Cancel</button>
            `;

            changeUsernameButton.parentNode.appendChild(wrapper);

            document.getElementById('username-submit').onclick = async function() {
                const usernameInput = document.getElementById('username').value;
                if (usernameInput.trim() === "") {
                    document.getElementById('username-error').innerText = "Username cannot be empty!";
                } else {
                    let url = `/change-username`;
                    let username = sessionStorage.getItem("username");
                    
                    console.log(`Fetching from ${url}`);
                    try {
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ username, newUsername: usernameInput})
                        });

                        if (!response.ok) {
                            throw new Error('Failed to change password');
                        }

                        const message = await response.text(); // Get the response message
                        document.getElementById('username-error').innerText = message;
                        
                        if(message === "Username changed successfully") {
                            sessionStorage.setItem("username", usernameInput);
                            window.location.reload();

                            // Hide the new fields and show the original button again
                            wrapper.remove(); // Remove the input fields and submit button
                            changeUsernameButton.style.display = 'inline-block'; // Show the original button again

                            // Show all other buttons
                            toggleButtonsVisibility(true);
                        }

                    } catch (err) {
                        console.error('Error changing username:', err);
                        document.getElementById('username-error').innerText = "Error changing username";
                    }
                   

                }
            };

            document.getElementById('username-cancel').onclick = function() {
                // Hide the new fields and show the original button again
                wrapper.remove(); // Remove the input fields and submit button
                changeUsernameButton.style.display = 'inline-block'; // Show the original button again

                // Show all other buttons
                toggleButtonsVisibility(true);
            };
        };
    } else {
        console.error('Change Username button not found.');
    }
});

// Helper function to toggle visibility of all settings buttons except the clicked one
function toggleButtonsVisibility(visible) {
    const buttons = document.querySelectorAll('.setting button');
    buttons.forEach(button => {
        button.style.display = visible ? 'inline-block' : 'none';
    });
}

function isStrongPassword(password) {
    let error = "";
    if (password.length < 8) {
        error += "Password needs to be more than 8 characters.";
    }
    if (!/[A-Z]/.test(password)) {
        error += "Password needs to have a capital letter.";
    }
    return error;
}
