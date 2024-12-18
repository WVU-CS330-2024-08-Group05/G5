/**
 * Initializes the script once the DOM is ready.
 * Handles user account functionalities including fetching trips,
 * changing username, and changing password.
 */

console.log("getting trips...");

$(async function () {
    const username = sessionStorage.getItem("username");

    if (window.location.pathname.endsWith('account.html') || window.location.pathname === '/') {
        if (username) {
            $('#username-written').text(username);

            try {
                /**
                 * Fetch and display user trips.
                 * @async
                 */
                const trips = await Trip.getAccountTrips(username);

                if (trips && trips.length > 0) {
                    const tripCardsHtml = await Promise.all(trips.map(trip => Trip.html(trip)));
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

/**
 * Event listener for clearing trips.
 */
document.addEventListener('DOMContentLoaded', function () {
    const clearTripsButton = document.getElementById('clear-trips');
    if (clearTripsButton) {
        /**
         * Clears all trips and reloads the page.
         * @async
         */
        clearTripsButton.onclick = async function () {
            console.log("Eradicating trips");
            await Trip.clearTrips();
            window.location.reload();
        };
    } else {
        console.error('Clear Trips button not found in the DOM.');
    }
});

/**
 * Event listener for changing the password.
 */
document.addEventListener('DOMContentLoaded', function () {
    const changePasswordButton = document.getElementById('password-change');
    if (changePasswordButton) {
        changePasswordButton.onclick = function () {
            toggleButtonsVisibility(false);
            changePasswordButton.style.display = 'none';

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

            /**
             * Validates and submits the new password.
             * @async
             */
            document.getElementById('password-submit').onclick = async function () {
                const passwordInput = document.getElementById('password').value;

                if (passwordInput.trim() === "") {
                    document.getElementById('password-error').innerText = "Password cannot be empty!";
                } else if (isStrongPassword(passwordInput).length > 0) {
                    document.getElementById('password-error').innerText = isStrongPassword(passwordInput);
                } else {
                    try {
                        const url = `/change-password`;
                        const username = sessionStorage.getItem("username");
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ username, password: passwordInput })
                        });

                        if (!response.ok) throw new Error('Failed to change password');

                        document.getElementById('password-error').innerText = "";
                        wrapper.remove();
                        changePasswordButton.style.display = 'inline-block';
                        toggleButtonsVisibility(true);
                    } catch (err) {
                        console.error('Error changing password:', err);
                    }
                }
            };

            document.getElementById('password-cancel').onclick = function () {
                wrapper.remove();
                changePasswordButton.style.display = 'inline-block';
                toggleButtonsVisibility(true);
            };
        };
    } else {
        console.error('Change Password button not found.');
    }

    /**
     * Event listener for changing the username.
     */
    const changeUsernameButton = document.getElementById('username-change');
    if (changeUsernameButton) {
        changeUsernameButton.onclick = function () {
            toggleButtonsVisibility(false);
            changeUsernameButton.style.display = 'none';

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

            /**
             * Validates and submits the new username.
             * @async
             */
            document.getElementById('username-submit').onclick = async function () {
                const usernameInput = document.getElementById('username').value;

                if (usernameInput.trim() === "") {
                    document.getElementById('username-error').innerText = "Username cannot be empty!";
                } else {
                    try {
                        const url = `/change-username`;
                        const username = sessionStorage.getItem("username");
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ username, newUsername: usernameInput })
                        });

                        if (!response.ok) throw new Error('Failed to change username');

                        const message = await response.text();
                        document.getElementById('username-error').innerText = message;

                        if (message === "Username changed successfully") {
                            sessionStorage.setItem("username", usernameInput);
                            window.location.reload();
                        }
                    } catch (err) {
                        console.error('Error changing username:', err);
                        document.getElementById('username-error').innerText = "Error changing username";
                    }
                }
            };

            document.getElementById('username-cancel').onclick = function () {
                wrapper.remove();
                changeUsernameButton.style.display = 'inline-block';
                toggleButtonsVisibility(true);
            };
        };
    } else {
        console.error('Change Username button not found.');
    }
});

/**
 * Toggles the visibility of all setting buttons except the clicked one.
 * @param {boolean} visible - Whether to show or hide the buttons.
 */
function toggleButtonsVisibility(visible) {
    const buttons = document.querySelectorAll('.setting button');
    buttons.forEach(button => {
        button.style.display = visible ? 'inline-block' : 'none';
    });
}

/**
 * Validates the strength of a password.
 * @param {string} password - The password to validate.
 * @returns {string} Error message if the password is weak, otherwise an empty string.
 */
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
