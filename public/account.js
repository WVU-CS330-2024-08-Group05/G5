console.log("getting trips...");
$(async function () {
    const username = sessionStorage.getItem("username");

    if (window.location.pathname.endsWith('account.html') || window.location.pathname === '/') {
        if (username) {
            $('#username-written').text(username);

            try {
                // Fetch trips from the server
                const trips = await Trip.getAccountTrips(username);

                if (trips && trips.length > 0) {
                    // Generate HTML for each trip and wait for all promises to resolve
                    const tripCardsHtml = await Promise.all(trips.map(trip => Trip.html(trip)));

                    // Append the resolved HTML to the 'user-locations' div and show it
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
