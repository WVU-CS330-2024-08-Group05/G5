const urlBase = 'http://localhost:8080';
let pinned_resorts = []; // initialize as empty, to be fetched later



// fetch pinned resorts when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        let username = sessionStorage.getItem("username");
        if (!username) {
            console.error('User is not logged in.');
            return;
        }

        pinned_resorts = await getPinnedResorts(username);
        console.log('Pinned Resorts:', pinned_resorts);

        // Apply pinned CSS to all pinned resorts
        setTimeout(() => {
            pinned_resorts.forEach((resort_name) => {
                const button = document.querySelector(`.pin-button[data-resort-name="${resort_name}"]`);
                if (button) {
                    updatePinButtonStyle(button, true); // Apply pinned style
                }
            });
        }, 1000); // Wait for dynamic content to load
    } catch (error) {
        console.error('Error initializing pinned resorts:', error);
    }
});


// function to pin a resort
async function pinResort(resort_name, username) {
    if (!pinned_resorts.includes(resort_name)) {
        pinned_resorts.push(resort_name);

        // save updated list to the database
        const success = await storePinnedResorts(username);
        if (success) {
            console.log(`${resort_name} has been pinned.`);
        } else {
            console.error('Failed to save pinned resorts to the database.');
        }
    } else {
        console.log(`${resort_name} is already pinned.`);
    }
}

// store pinned resorts in the database
async function storePinnedResorts(username) {
    const url = urlBase + '/set-pinned-resorts';
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
        return msg !== 'Failed'; // true if successful
    } catch (error) {
        console.error('Error saving pinned resorts:', error);
        return false;
    }
}

// get pinned resorts from the database
async function getPinnedResorts(username) {
    const url = urlBase + '/get-pinned-resorts';
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

        return await response.json(); // Return the JSON array of resort names
    } catch (error) {
        console.error('Error fetching pinned resorts:', error);
        return []; // Return an empty array on error
    }
}

// Function to check if a resort is already pinned
function isResortPinned(resort_name) {
    return pinned_resorts.includes(resort_name);
}

// Function to unpin a resort
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
}

// Function to update the pin button style
function updatePinButtonStyle(button, isPinned) {
    if (isPinned) {
        button.style.backgroundColor = "lightcoral";
    } else {
        button.style.backgroundColor = "";
    }
}


// event listener for a button to pin resorts
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


