$(function () {
    let tripsCount = 0;
    let username = sessionStorage.getItem("username");
    let totalHours = 0;
    let trips = [];

    // show username on page
    document.getElementById('username-written').textContent = username;

    // Fetch trips for the user and update the UI on page load
    $(document).ready(async function () {
        const fetchedTrips = await Trip.getAccountTrips(username);

        if (fetchedTrips && fetchedTrips.length > 0) {
            trips = fetchedTrips;
            tripsCount = trips.length;
            totalHours = trips.reduce((sum, trip) => sum + trip.hours, 0);

            document.getElementById('total-trips').textContent = `Total Trips: ${tripsCount}`;
            document.getElementById('total-hours').textContent = `Total Hours: ${totalHours}`;

            trips.forEach(trip => {
                let listItem = document.createElement('li');
                listItem.textContent = `Trip to ${trip.resort} on ${trip.date}, for ${trip.hours} hours, Review: ${trip.description}, Rating: ${trip.rating} stars`;
                document.getElementById('SkiTripList').append(listItem);
            });
        }
    });

    // Handle trip submission
    $('#hourSubmit').on('click', async function () {
        const newHours = parseFloat($("#Hours").val());
        const resort = $('#Resort').val();
        const date = $('#Date').val();
        const rating = $("input[name='rating']:checked").val();
        const description = $("#description").val();

        if (!newHours || !resort || !date || !rating) {
            alert('Please fill in all fields before submitting.');
            return;
        }

        totalHours += newHours;
        $("#totalHours").text(`Total Hours: ${totalHours}`);
        $("#Hours").val('');

        // Create a new trip and add to the array
        const newTrip = new Trip(resort, newHours, date, rating, description);

        tripsCount += 1;
        document.getElementById('total-trips').textContent = `Total Trips: ${tripsCount}`;
        document.getElementById('total-hours').textContent = `Total Hours: ${totalHours}`;

        // Add trip to the UI
        let listItem = document.createElement('li');
        listItem.textContent = `Trip to ${resort} on ${date}, for ${newHours} hours, Rating: ${rating} stars, Review: ${description}`;
        document.getElementById('SkiTripList').append(listItem);

        // Store the trips in the database
        await Trip.storeTripsInAccount(username, newTrip);
    });
});

