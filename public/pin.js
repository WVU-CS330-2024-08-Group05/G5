/**
 * Manages the pinned resorts functionality:
 * - Fetches pinned resorts from the database on page load.
 * - Allows users to pin or unpin resorts.
 * - Updates the database and UI to reflect the pinned state.
 */

// Initialize the list of pinned resorts as empty
let pinned_resorts = [];

/**
 * Fetches pinned resorts when the page loads and applies the "pinned" style to buttons.
 */
document.addEventListener('DOMContentLoaded', async () => {
    try {
        let username = sessionStorage.getItem("username");
        if (!username) {
            console.log('User is not logged in.');
            return;
        }

        // Fetch pinned resorts for the logged-in user
        pinned_resorts = await getPinnedResorts(username);
        console.log('Pinned Resorts:', pinned_resorts);

        // Apply the "pinned" style to all relevant buttons
        setTimeout(() => {
            pinned_resorts.forEach((resort_name) => {
                const button = document.querySelector(`.pin-button[data-resort-name="${resort_name}"]`);
                if (button) {
                    updatePinButtonStyle(button, true);
                }
            });
        }, 500); // Allow time for dynamic content to load
    } catch (error) {
        console.error('Error initializing pinned resorts:', error);
    }

    updatePinnedHtml();
});

/**
 * Pins a resort for the user.
 * 
 * @param {string} resort_name - The name of the resort to pin.
 * @param {string} username - The username of the logged-in user.
 */
async function pinResort(resort_name, username) {
    if (!pinned_resorts.includes(resort_name)) {
        pinned_resorts.push(resort_name);

        // Save the updated list to the database
        const success = await storePinnedResorts(username);
        if (success) {
            console.log(`${resort_name} has been pinned.`);
        } else {
            console.error('Failed to save pinned resorts to the database.');
        }
    } else {
        console.log(`${resort_name} is already pinned.`);
    }

    updatePinnedHtml();
}

/**
 * Stores the updated list of pinned resorts in the database.
 * 
 * @param {string} username - The username of the logged-in user.
 * @returns {Promise<boolean>} - True if the operation was successful, false otherwise.
 */
async function storePinnedResorts(username) {
    const url = '/set-pinned-resorts';
    console.log(`Posting to ${url}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, pinned_resorts }),
        });

        if (!response.ok) {
            throw new Error('Failed to save pinned resorts to the database.');
        }

        const msg = await response.text();
        return msg !== 'Failed'; // True if successful
    } catch (error) {
        console.error('Error saving pinned resorts:', error);
        return false;
    }
}

/**
 * Fetches the list of pinned resorts for the user from the database.
 * 
 * @param {string} username - The username of the logged-in user.
 * @returns {Promise<string[]>} - An array of pinned resort names.
 */
async function getPinnedResorts(username) {
    const url = '/get-pinned-resorts';
    console.log(`Getting from ${url}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch pinned resorts from the database.');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching pinned resorts:', error);
        return [];
    }
}

/**
 * Checks if a resort is pinned.
 * 
 * @param {string} resort_name - The name of the resort to check.
 * @returns {boolean} - True if the resort is pinned, false otherwise.
 */
function isResortPinned(resort_name) {
    return pinned_resorts.includes(resort_name);
}

/**
 * Unpins a resort for the user.
 * 
 * @param {string} resort_name - The name of the resort to unpin.
 * @param {string} username - The username of the logged-in user.
 */
async function unpinResort(resort_name, username) {
    const index = pinned_resorts.indexOf(resort_name);

    if (index !== -1) {
        pinned_resorts.splice(index, 1); // Remove the resort from the array

        // Save the updated list to the database
        const success = await storePinnedResorts(username);
        if (success) {
            console.log(`${resort_name} has been unpinned.`);
        } else {
            console.error('Failed to save updated pinned resorts to the database.');
        }
    } else {
        console.log(`${resort_name} is not pinned.`);
    }

    updatePinnedHtml();
}

/**
 * Updates the style of the pin button to reflect the pinned state.
 * 
 * @param {HTMLElement} button - The pin button element.
 * @param {boolean} isPinned - True if the resort is pinned, false otherwise.
 */
function updatePinButtonStyle(button, isPinned) {
    if (isPinned) {
        button.style.backgroundColor = "lightcoral";
    } else {
        button.style.backgroundColor = "";
    }
}

/**
 * Event listener for clicking pin buttons.
 * - Pins or unpins the resort and updates the UI accordingly.
 */
document.addEventListener('click', async (event) => {
    if (event.target.closest('.pin-button')) {
        event.preventDefault(); // Prevent default button behavior
        const button = event.target.closest('.pin-button'); // Get the button element
        const resortName = button.dataset.resortName; // Retrieve resort name

        const username = sessionStorage.getItem("username");

        if (!username) {
            console.error('User is not logged in.');
            return;
        }

        if (isResortPinned(resortName)) {
            await unpinResort(resortName, username);
            updatePinButtonStyle(button, isResortPinned(resortName));
        } else {
            await pinResort(resortName, username);
            updatePinButtonStyle(button, isResortPinned(resortName));
        }
    }
});

async function updatePinnedHtml() {
    if (window.location.pathname === '/index.html') {
        try {
            console.log('Updating pinned');
            let html = await fetch('/resort-cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pinned_resorts),
            });
            html = await html.text();
            $('#main').html(html);
        } catch (err) {
            console.error(err);
        }
    }

    drawCharts();
}
