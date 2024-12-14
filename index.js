/**
 * Server on http://localhost:8080
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const mssql = require('mssql');
const bcrypt = require('bcrypt');
const RESORTS = require('./resortdata.json');
const NodeGeolocation = require('nodejs-geolocation').default;
const geo = new NodeGeolocation('App');
const Weather = require('./weather.js');
const ResortCard = require('./ResortCard.js');
const sql = require('./sql');

MAX_RESULTS = 10;
MAX_FETCH_ATTEMPTS = 5;

// serve files from public dir
app.use(express.static(path.join(__dirname, 'public')));


//dynamic porting
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});


// Middleware to parse json
app.use(express.json());


/**
 * Search functionality
 * 
 * Search results include resorts with names that start with req.query.search and resorts that are in a state the the begins with req.query.search.
 */
app.get('/search.html', async function (req, res) {
    // Get all resorts
    resorts = [...RESORTS];
    options = { distance: false };
    // Filter resorts by text segment
    if (req.query.search) {
        resorts = filterBySearch(resorts, req.query.search)
    }
    // Filter resorts by distance from location
    if (req.query.lat && req.query.lon && req.query.range) {
        resorts = filterByDistance(resorts, req.query, req.query.range);
        options.distance = true;
    }

    // Try to send search results
    for (i = 0; i < MAX_FETCH_ATTEMPTS; ++i) {
        try {
            // Get search results html
            const html = await searchResultsHtml(resorts, options);
            res.send(html);
        } catch (err) {
            res.send('<h2> Failed to from fetch National Weather Service API</h2>' +
                '<h3>Please try again later...</h3>');
        }
    }
});

async function searchResultsHtml(resorts, options) {
    let results_html = "";
    // Sort resorts by distance from location
    if (options.distance) {
        resorts.sort((a, b) => a.distance - b.distance);
    }

    // Create results HTML
    for (let i = 0; i < MAX_RESULTS && i < resorts.length; ++i) {
        const resort = resorts[i];
        for (let j = 0; j < MAX_FETCH_ATTEMPTS; ++j) {
            try {
                const cardHtml = await ResortCard.html(resort, options); // Await the card HTML
                html = html + cardHtml; // Append to accumulated HTML
            } catch (err) {
                if (i == 4) {
                    throw err;
                }
                else {
                    console.error(`Nation weather service api timed out: try ${i + 1}/5.`);
                }
            }
        }
    }

    let page_footer = '';

    return results_html + page_footer;
}

function filterBySearch(resorts, search) {
    let new_resorts = new Array();
    for (let resort of resorts) {
        if (resort.state.toLowerCase().includes(search.toLowerCase()) ||
            resort.resort_name.toLowerCase().includes(search.toLowerCase()))
            new_resorts.push(resort);
    }
    return new_resorts;
}

function filterByDistance(trips, location, range) {
    let new_resorts = new Array();
    for (let resort of resorts) {
        let distance = geo.calculateDistance(resort, location, { unit: 'mi' });
        resort['distance'] = distance;
        if (distance < range) {
            new_resorts.push(resort);
        }
    }
    return new_resorts;
}


/** Get resort names */
app.get('/resort-names', async function (req, res) {
    let resorts = [...RESORTS];

    // Extract resort names using map
    let resort_names = resorts.map(resort => resort.resort_name);

    // Send the array of resort names as the response
    res.send(resort_names);
});



/**  Login Functionality
 * 
 * check if username is in database, then check if password matches
*/
app.post('/login', async function (req, res) {
    let msg = "";
    
    let username = req.body.username;
    let password = req.body.password;

    let username_exists = await sql.getId(username);
    let password_matches;

    msg = username_exists;

    if (username_exists === "User found") {
        password_matches = await sql.getPassword(username, password);
        msg = password_matches;
    }

    res.send(msg);
});


/**
 * Sign Up functionality
 */

app.post("/signing-up", async function (req, res) {
    let msg = "";
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    try {
        // Check if username is already taken
        const usernameExists = await sql.getId(username);

        if (usernameExists === "User found") {
            msg = "Username taken";
        } else {
            // Proceed with creating account
            msg = await sql.creatAccount(username, password, email); // Password hashing happens in connectAndInsertAccount
        }
    } catch (err) {
        console.error(err.message);
        msg = "Error signing up. Please try again later.";
    }

    res.send(msg);
});


/** Pulling Ratings */

// Function to get the list of ratings
app.get('/pull-ratings', async (req, res) => {
    try {
        // Query to retrieve ratings
        const query = `
            SELECT 
                JSON_VALUE(trip.value, '$.resort') AS resort_name,
                CAST(JSON_VALUE(trip.value, '$.rating') AS FLOAT) AS rating
            FROM 
                Accounts
            CROSS APPLY 
                OPENJSON(CAST(trips AS NVARCHAR(MAX))) AS trip
            WHERE 
                JSON_VALUE(trip.value, '$.rating') IS NOT NULL;
        `;

        // Execute the query
        const result = await poolConnection.request().query(query);

        // Send the results as JSON
        res.json(result.recordset);

    } catch (error) {
        console.error('Error executing query:', error);
        res.send('Error retrieving ratings');
    }
});


/** Trips Functionality */

app.post("/account-trips", async function (req, res) {
    let msg = null; // Default to no data
    const username = req.body.username;
    try {
        msg = await sql.getTrips(username);
    } catch (err) {
        console.error(err.message);
        msg = { error: "Error retrieving trips. Please try again later." }; // Send error as JSON
    }

    res.json(msg); // Ensure response is always JSON
});


app.post("/store-trips", async function (req, res) {
    let msg = "Storing account failed";  // Default error message
    const username = req.body.username;
    const trips = req.body.trips;

    if (!username || !trips) {
        msg = "Username and trips are required.";
        return res.send(msg);
    }

    try {
        msg = await sql.setTrips(username, trips);
    } catch (err) {
        console.error('Error storing trips:', err);
        msg = 'Failed to store trips in the database.';
    }

    res.send(msg);
});

/** Pin Resorts */

app.post("/set-pinned-resorts", async function (req, res) {
    let username = req.body.username;
    let pinned = req.body.pinned_resorts;

    const query = `UPDATE Accounts SET pinned_resorts = @pinned WHERE username = @username`;
    const input = [
        { name: 'username', type: mssql.VarChar, value: username },
        { name: 'pinned', type: mssql.NVarChar, value: typeof pinned === 'string' ? pinned : JSON.stringify(pinned) }
    ];

    try {
        await sql.executeQuery(query, input);
        res.send("Successful");
    } catch (err) {
        console.error('Error in saving pinned resorts:', err);
        res.send("Failed");
    }

})


// POST route handler
app.post("/get-pinned-resorts", async function (req, res) {
    const username = req.body.username;
    const pinnedResorts = await getPinnedResorts(username); // Call the function to get pinned resorts
    res.send(pinnedResorts); // Send the result back to the client
});

// Function to handle the query and return the pinned resorts
async function getPinnedResorts(username) {
    let msg = []; // Default to empty array if no resorts are found

    const query = "SELECT pinned_resorts FROM Accounts WHERE username COLLATE Latin1_General_BIN = @username";
    const input = [{ name: 'username', type: mssql.VarChar, value: username }];
    const resultSet = await sql.executeQuery(query, input);


    if (resultSet.recordset && resultSet.recordset.length > 0) {
        const pinnedString = resultSet.recordset[0].pinned_resorts;

        // Ensure pinnedString is valid JSON
        if (pinnedString) {
            try {
                const pinned = JSON.parse(pinnedString); // Parse JSON
                msg = pinned; // Assign parsed JSON to msg
            } catch (error) {
                console.error("Failed to parse JSON from database:", error);
                msg = []; // Return empty array on parsing failure
            }
        }
    }

    return msg; // Return the result
}
