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
    static tripsToJson(tripsArray) {
        console.log("tripsToJson, before" + tripsArray);
        console.log("tripsToJson, after" + JSON.stringify(tripsArray));
        return JSON.stringify(tripsArray);
    }

    // Convert JSON back to trips array (and store them as Trip objects)
    static jsonToArray(tripsJSON) {
        console.log("Converting JSON to Array. Input:", tripsJSON.length);
        // Ensure trips are converted into Trip objects
        if (Array.isArray(tripsJSON)) {
            return tripsJSON.flatMap(tripData => {
                if (Array.isArray(tripData)) {
                    // Handle nested arrays
                    return tripData.map(innerTrip =>
                        new Trip(innerTrip.resort, innerTrip.hours, innerTrip.date, innerTrip.rating)
                    );
                } else if (tripData.resort && tripData.hours && tripData.date && tripData.rating) {
                    // Handle direct trip objects
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
    static async storeTripsInAccount(username, trip) {
        const url = `${urlBase}/store-trips`;

        if (username) {
            try {
                // get the current trips using the existing function
                let currentTrips = await Trip.getAccountTrips(username);
                
                // add the new trip to the list of trips
                if (Array.isArray(currentTrips)) {
                    currentTrips.push(trip);
                    console.log("Current:" + currentTrips);
                } else {
                    console.warn("Unexpected data format; resetting trips to an empty array.");
                    currentTrips = [trip];
                }
                // convert updated trips array to JSON
                const tripsJSON = Trip.tripsToJson(currentTrips);
                // store updated trips in the database
                const storeResponse = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, trips: tripsJSON }),
                });

                if (!storeResponse.ok) {
                    throw new Error('Failed to store updated trips in the database.');
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
        const url = urlBase + '/account-trips';
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
                console.log("Parsed response from server:", result.length);

                if (Array.isArray(result)) {
                    // Convert JSON to Trip objects and update the global trips array
                    console.log("Pre jsonToArray: " + result.length);
                    trips = Trip.jsonToArray(result); 
                    console.log('Trips successfully retrieved:', trips.length);
                    return trips;
                } else {
                    console.error("Unexpected response format:", result);
                    trips = []; // Reset trips if format is invalid
                    return trips;
                }
            } catch (error) {
                console.error('Error fetching trips:', error);
                trips = []; // Reset trips in case of an error
                return trips;
            }
        } else {
            console.log("Username is required to fetch trips.");
            return [];
        }
    }
    
}
