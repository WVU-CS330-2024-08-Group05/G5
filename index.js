/**
 * Snowhere you'r going server entry point.
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const mssql = require('mssql');
const Search = require('./src/Search.js');
const sql = require('./sql');
const RESORTS = require('./resortdata.json');
const cors = require('cors');
const fs = require('fs');
const https = require('https');

// serve files from public dir
app.use(express.static(path.join(__dirname, 'public')));


//dynamic porting
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Listening on port ${PORT}...`);
// });


// Read the certificate and key files
const privateKey = fs.readFileSync('private.key', 'utf8');
const certificate = fs.readFileSync('certificate.crt', 'utf8');

// Set up SSL options
const credentials = { key: privateKey, cert: certificate };

// Create an HTTPS server and listen on port 5000
https.createServer(credentials, app).listen(5000, () => {
  console.log('Server running on https://<your-ip>:5000');
});

// Middleware to parse json
app.use(express.json());


// Allow requests from specific origins
const corsOptions = {
    origin: 'http://135.237.82.237:5000', // Frontend's URL
    methods: ['GET', 'POST'], // Allow specific methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
};

// Apply CORS middleware
app.use(cors(corsOptions));


/**
 * Search functionality
 * 
 * Search results include resorts with names that start with req.query.search and resorts that are in a state the the begins with req.query.search.
 */
app.get('/search.html', async function (req, res) {
    // Set search options
    const port = req.socket.localPort ? ':' + req.socket.localPort : '';
    options = {
        lat: req.query.lat,
        lon: req.query.lon,
        range: req.query.range,
        search: req.query.search,
        distance: false,
        page: 1, 
        url: `${req.protocol}://${req.hostname}${port}${req.url}`,
    };

    // Check if page number is requested
    if (req.query.page) options.page = req.query.page;

    // Try to send search results
    try {
        // Get search results html
        const html = await Search.html(options);
        res.send(html);
    } catch (err) {
        console.error(err);
        res.send('<h2> Failed to from fetch National Weather Service API</h2>' +
            '<h3>Please try again later...</h3>');
    }

});


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
