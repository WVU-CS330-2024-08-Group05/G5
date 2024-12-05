/** Completed Trips Object / Method Calls
 *      Data to be stored: Resort name, hours, date, rating. Written review in the future
 * 
 *      Function: Store as JSON, that upload to data base. 
 * 
 *      Each trip will be it's own object, that way we can store a list of object in the database's json
 */
const urlBase = 'https://cs330-5-webapp-eqbjb0c6f2hfbxft.canadacentral-01.azurewebsites.net';

class Trip {
    constructor(resort, hours, date, rating) {
        this.resort = resort;
        this.hours = hours;
        this.date = date; // (mm/dd/yyyy)
        this.rating = rating; // integer 0-5
    }

    // Convert trips array to JSON
    static tripsToJson(tripsArray) {
        return JSON.stringify(tripsArray);
    }

    // Convert JSON back to trips array (and store them as Trip objects)
    static jsonToArray(tripsJSON) {
        console.log("Converting JSON to Array. Input:", tripsJSON.length);

        if (Array.isArray(tripsJSON)) {
            return tripsJSON.flatMap(tripData => {
                if (Array.isArray(tripData)) {
                    return tripData.map(innerTrip =>
                        new Trip(innerTrip.resort, innerTrip.hours, innerTrip.date, innerTrip.rating)
                    );
                } else if (tripData.resort && tripData.hours && tripData.date && tripData.rating) {
                    return new Trip(tripData.resort, tripData.hours, tripData.date, tripData.rating);
                } else {
                    console.warn("Unexpected trip data format:", tripData);
                    return [];
                }
            });
        } else {
            console.error("Unexpected format; expected an array but received:", tripsJSON);
            return [];
        }
    }

    // Store trips in the database for a specific user
    static async storeTripsInAccount(username, tripsArray) {
        const url = `${urlBase}/store-trips.html`;

        if (username) {
            try {
                const tripsJSON = Trip.tripsToJson(tripsArray);

                const storeResponse = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, trips: tripsJSON }),
                });

                if (!storeResponse.ok) {
                    throw new Error('Failed to store trips in the database.');
                }

                const result = await storeResponse.text();
                if (result.includes('successfully stored')) {
                    console.log('Trips successfully updated:', result);
                } else {
                    console.error('Error updating trips:', result);
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
        const url = `${urlBase}/account-trips.html`;
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

                const result = await response.json();

                if (Array.isArray(result)) {
                    return Trip.jsonToArray(result); // Return Trip objects
                } else {
                    console.error("Unexpected response format:", result);
                    return []; // Return an empty array if format is invalid
                }
            } catch (error) {
                console.error('Error fetching trips:', error);
                return []; // Return an empty array in case of an error
            }
        } else {
            console.log("Username is required to fetch trips.");
            return [];
        }
    }
}
