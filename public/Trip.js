/**
 * Represents a completed trip with details about the resort, hours spent, date, rating, and description.
 */
class Trip {
    static trips =[];
    /**
     * Creates a new Trip instance.
     * @param {string} resort - The name of the resort.
     * @param {number} hours - The number of hours spent at the resort.
     * @param {string} date - The date of the trip (format: mm/dd/yyyy).
     * @param {number} rating - The rating of the trip (0-5).
     * @param {string} description - A brief description or review of the trip.
     */
    constructor(resort, hours, date, rating, description) {
        this.resort = resort;
        this.hours = hours;
        this.date = date;
        this.rating = rating;
        this.description = description;
    }

    /**
     * Converts an array of trips to a JSON string.
     * @param {Trip[]} tripsArray - An array of Trip objects.
     * @returns {string} The JSON string representation of the trips array.
     */
    static tripsToJson(tripsArray) {
        return JSON.stringify(tripsArray);
    }

    /**
     * Converts a JSON string back to an array of Trip objects.
     * @param {Object[]} tripsJSON - The JSON data representing trips.
     * @returns {Trip[]} An array of Trip objects.
     */
    static jsonToArray(tripsJSON) {
        if (Array.isArray(tripsJSON)) {
            return tripsJSON.flatMap(tripData => {
                if (Array.isArray(tripData)) {
                    return tripData.map(innerTrip =>
                        new Trip(innerTrip.resort, innerTrip.hours, innerTrip.date, innerTrip.rating, innerTrip.description)
                    );
                } else if (tripData.resort && tripData.hours && tripData.date && tripData.rating && tripData.description) {
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

    /**
     * Stores a new trip for a user in the database.
     * @param {string} username - The username of the account.
     * @param {Trip} trip - The trip to store.
     * @returns {Promise<void>}
     */
    static async storeTripsInAccount(username, trip) {
        const url = `/store-trips`;

        if (username) {
            try {
                let currentTrips = await Trip.getAccountTrips(username);
                if (Array.isArray(currentTrips)) {
                    currentTrips.push(trip);
                } else {
                    currentTrips = [trip];
                }
                const tripsJSON = Trip.tripsToJson(currentTrips);
                const storeResponse = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, trips: tripsJSON }),
                });

                if (!storeResponse.ok) {
                    throw new Error('Failed to store updated trips in the database.');
                }
                const result = await storeResponse.text();
                console.log(result.includes('successfully stored') ? 'Trips successfully updated' : 'Error updating trips:', result);
            } catch (error) {
                console.error('Error storing trips:', error);
            }
        } else {
            console.log("Username is required to store trips.");
        }
    }

    /**
     * Fetches stored trips for a user from the database.
     * @param {string} username - The username of the account.
     * @returns {Promise<Trip[]>} An array of Trip objects.
     */
    static async getAccountTrips(username) {
        const url = '/account-trips';
        if (username) {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch trips from the database.');
                }

                const result = await response.json();
                if (Array.isArray(result)) {
                    Trip.trips= Trip.jsonToArray(result);
                    return Trip.trips;
                } else {
                    console.error("Unexpected response format:", result);
                    Trip.trips= [];
                    return Trip.trips;
                }
            } catch (error) {
                console.error('Error fetching trips:', error);
                Trip.trips= [];
                return Trip.trips;
            }
        } else {
            console.log("Username is required to fetch trips.");
            return [];
        }
    }

    /**
     * Fetches the ratings of trips from the server.
     * @returns {Promise<Object[]>} The ratings data.
     */
    async getRatings() {
        const url = '/pull-ratings';
        try {
            const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
            if (!response.ok) {
                throw new Error('Failed to fetch ratings from the database.');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching ratings:', error);
            return [];
        }
    }

    /**
     * Clears all trips for the logged-in user.
     * @returns {Promise<void>}
     */
    static async clearTrips() {
        const username = sessionStorage.getItem("username");
        Trip.trips= [];
        const url = '/store-trips';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, trips: Trip.trips }),
            });

            if (!response.ok) {
                throw new Error('Failed to clear trips from the database.');
            }
        } catch (error) {
            console.error('Error removing trips:', error);
        }
    }

    /**
     * Generates the HTML for a trip card.
     * @param {Trip} trip - The trip to render.
     * @returns {Promise<string>} The HTML string for the trip card.
     */
    static async html(trip) {
        const { resort, date, hours, rating, description } = trip;
        return `
            <div class="trip-card">
                <div class="location-title">
                    <h2>${resort}</h2>
                    <div class="resort-rating">${rating} <span class="star">★</span></div>
                </div>
                <div class="location-content">
                    <div class="image-container">
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
