/** Completed Trips Object / Method Calls
 *      Data to be stored: Resort name, hours, date, rating. Written review in the future
 * 
 *      Function: Store as JSON, that upload to data base. 
 * 
 *      Each trip will be it's own object, that way we can store a list of object in the database's json
 */

let trips = [];

class Trip {
    constructor(resort, hours, date, rating, description) {
        this.resort = resort;
        this.hours = hours;
        this.date = date; // (mm/dd/yyyy)
        this.rating = rating; // integer 0-5
        this.description = description;
    }

    // Convert trips array to JSON
    static tripsToJson(tripsArray) {;
        return JSON.stringify(tripsArray);
    }

    // Convert JSON back to trips array (and store them as Trip objects)
    static jsonToArray(tripsJSON) {
        // Ensure trips are converted into Trip objects
        if (Array.isArray(tripsJSON)) {
            return tripsJSON.flatMap(tripData => {
                if (Array.isArray(tripData)) {
                    // Handle nested arrays
                    return tripData.map(innerTrip =>
                        new Trip(innerTrip.resort, innerTrip.hours, innerTrip.date, innerTrip.rating, innerTrip.description)
                    );
                } else if (tripData.resort && tripData.hours && tripData.date && tripData.rating, tripData.description) {
                    // Handle direct trip objects
                    return new Trip(tripData.resort, tripData.hours, tripData.date, tripData.rating, tripData.description);
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
        const url = `/store-trips`;

        if (username) {
            try {
                // get the current trips using the existing function
                let currentTrips = await Trip.getAccountTrips(username);
                
                // add the new trip to the list of trips
                if (Array.isArray(currentTrips)) {
                    currentTrips.push(trip);

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
        const url = '/account-trips';
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

                if (Array.isArray(result)) {
                    // Convert JSON to Trip objects and update the global trips array
                    trips = Trip.jsonToArray(result); 
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
    

    async getRatings(){
        const url = '/pull-ratings';
        console.log(`Getting from ${url}...`);
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch trips from the database.');
            }

            // Directly retrieve the JSON response
            const result = await response.json();
            
            return result;

        }  catch(err) {
                console.error('Error fetching ratings:', error);
                ratings = []; // Reset trips in case of an error
                return trips;
        }
    }

    static async html(trip) {
        let { resort, date, hours, rating, description } = trip;

        return `
            <div class="trip-card">
                <div class="location-title">
                    <h2>${resort}</h2>
                    <div class="resort-rating">${rating} <span class="star">★</span></div>
                </div>
                <div class="location-content">
                    <div class="image-container">
                        <img class="location-img" src="placeholder.png" alt="Picture of Resorts" height="200" width="200">
                    </div>
                    <div class="user-review">
                        <h3>Review</h3>
                        <p>I visited for ${hours} hours on ${date}. ${description}</p>
                    </div>
                </div>
                <div class="info-container">
                    <div class="date-logged">Date: ${date}</div>
                    <div class="hours-logged">Hours Logged: ${hours}</div>
                </div>
            </div>
        `;
    }
}

