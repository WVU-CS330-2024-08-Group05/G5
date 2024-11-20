/** Completed Trips Object / Method Calls
 *      Data to be stored: Resort name, hours, date, rating. Written review in the future
 * 
 *      Function: Store as JSON, that upload to data base. 
 * 
 *      Each trip will be it's own object, that way we can store a list of object in the database's json
 */
const urlBase = 'http://localhost:8080';

let trips = []; // This stores all the trips as an array of Trip objects

class Trip {
    constructor(resort, hours, date, rating) {
        this.resort = resort;
        this.hours = hours;
        this.date = date; // (mm/dd/yyyy)
        this.rating = rating; // integer 0-5

        // add this instance to the trips array
        trips.push(this);
    }

    // convert trips array to JSON
    tripsToJson() {
        return JSON.stringify(trips);
    }

    // convert JSON back to trips array (and store them as Trip objects)
    static jsonToArray(tripsJSON) {
        trips = JSON.parse(tripsJSON).map(tripData => new Trip(tripData.resort, tripData.hours, tripData.date, tripData.rating));
    }

    // Store the current list of trips in the database
async storeInAccount(username) {
    const tripsJSON = this.tripsToJson();  // Convert the trips array to JSON

    // Query to store the trips in the database
    const url = urlBase + '/store-trips.html';  // Endpoint for storing trips
    console.log(`Posting to ${url}...`);

    if (username) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, trips: tripsJSON })
            });

            if (!response.ok) {
                throw new Error('Failed to store trips in the database.');
            }

            const result = await response.text();  // Get the error or success message from the backend
            if (result.includes('successfully stored')) {
                console.log('Trips successfully stored:', result);
            } else {
                // If the message indicates failure, display it
                console.error('Error:', result);
            }
        } catch (error) {
            console.error('Error storing trips:', error);
        }
    } else {
        console.log("Username is required to store trips.");
    }
}



    // Fetch stored trips for a user from the server
    static async getAccountTrips(username) {
        const url = urlBase + '/account-trips.html'; // Endpoint for fetching trips
        console.log(`Posting to ${url}...`); // Debugging

        if (username) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch trips from the database.');
                }

                const result = await response.json();
                if (result) {
                    // Convert the JSON result into Trip objects
                    Trip.jsonToArray(result);
                    console.log('Trips successfully retrieved:', trips);
                    return trips;  // Return the trips array
                }
            } catch (error) {
                console.error('Error fetching trips:', error);
            }
        } else {
            console.log("Username is required to fetch trips.");
        }
    }
}

// Test to pull trips for the account with username "Testingt"
async function testGetAccountTrips() {
    const username = 'Testingt'; // Username for which we want to fetch trips
    const retrievedTrips = await Trip.getAccountTrips(username); // Fetch trips for the user
    console.log(retrievedTrips); // Log the trips retrieved
}

// Call the test function
testGetAccountTrips();
