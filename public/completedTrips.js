/** Completed Trips Object / Method Calls
 *      Data to be stored: Resort name, hours, date, rating. Written review in the future
 * 
 *      Function: Store as JSON, that upload to data base. 
 * 
 *      Each trip will be it's own object, that way we can store a list of object in the database's json
 */
const urlBase = 'http://localhost:8080';

let trips = [];

class Trip {
    
    constructor(resort, hours, date, rating) {
        this.resort = resort;
        this.hours = hours;
        this.date = date; // (mm/dd/yyyy)
        this.rating = rating; // integer 0-5
    }

    // Convert trips array to JSON
    static tripsToJson(trips) {
        return JSON.stringify(trips);
    }

    // Convert JSON back to trips array (and store them as Trip objects)
    static jsonToArray(tripsArray) {
        trips = tripsArray.map(tripData => new Trip(tripData.resort, tripData.hours, tripData.date, tripData.rating));
    }


    // Store trips in the database for a specific user
    static async storeTripsInAccount(username, trips) {
        const tripsJSON = Trip.tripsToJson(trips); // Convert trips array to JSON
        const url = `${urlBase}/store-trips.html`;

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

                const result = await response.text();
                if (result.includes('successfully stored')) {
                    console.log('Trips successfully stored:', result);
                } else {
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
        const url = urlBase + '/account-trips.html';
        console.log(`Posting to ${url}...`);
    
        if (username) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username }),
                });
    
                if (!response.ok) {
                    throw new Error('Failed to fetch trips from the database.');
                }
    
                // Directly retrieve the JSON response
                const result = await response.json();
                console.log("Parsed response from server:", result);
    
                if (Array.isArray(result)) {
                    // If it's an array, convert it to Trip objects
                    Trip.jsonToArray(result);
                    console.log('Trips successfully retrieved:', trips);
                    return trips;
                } else {
                    console.error("Unexpected response format:", result);
                    return [];
                }
            } catch (error) {
                console.error('Error fetching trips:', error);
            }
        } else {
            console.log("Username is required to fetch trips.");
        }
    }
    
    
    
    
}

// Test function for fetching trips
async function testGetAccountTrips() {
    const username = 'Testingt'; // Example username
    const retrievedTrips = await Trip.getAccountTrips(username);
    console.log(retrievedTrips); // Log the retrieved trips
}

// Call the test function
testGetAccountTrips();
