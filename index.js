/**
 * @file Snowhere You're Going - Server Entry Point
 * 
 * This file serves as the main server entry point for the application. It includes
 * endpoints for user authentication, resort searching, trip management, and email-based
 * password recovery. Middleware and external modules are integrated to provide functionality.
 */
// Load environment variables from .env
require('dotenv').config();

// Import dependencies
const express = require('express');
const path = require('path');
const mssql = require('mssql');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

// Import local modules
const sql = require('./sql');
const RESORTS = require('./resortdata.json');
const Search = require('./src/Search.js');
const ResortCard = require('./src/ResortCard.js');

// Initialize Express app
const app = express();

// serve files from public dir
app.use(express.static(path.join(__dirname, 'public')));


//dynamic porting
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});


// Middleware
app.use(express.json());
app.use(bodyParser.json());

/**
 * @description Endpoint for searching resorts based on query parameters.
 * 
 * Filters resorts by name, state, or proximity and generates a paginated HTML response.
 * 
 * @route GET /search.html
 * @query {string} search - Text to search for resorts by name or state.
 * @query {number} lat - Latitude for distance-based filtering.
 * @query {number} lon - Longitude for distance-based filtering.
 * @query {number} range - Maximum distance from the location in miles.
 * @query {number} page - Current page number for pagination.
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

/**
 * @description Endpoint for generating resort cards.
 * 
 * @route POST /resort-cards
 * @body {string[]} resort_names - Array of resort names to generate cards for.
 */
app.post("/resort-cards", async function (req, res) {
    let resort_names;

    try {
        resort_names = req.body;
    } catch (err) {
        console.error(err);
        res.send('Error parsing resorts');
        return;
    }

    let html = '';
    for (let name of resort_names) {
        for (let resort of RESORTS) {
            if (resort.resort_name === name) {
                html += await ResortCard.html(resort, { distance: false });
            }
        }
    }

    res.send(html);
});


/**
 * @description Endpoint to retrieve resort names.
 * 
 * @route GET /resort-names
 * @returns {string[]} Array of resort names.
 */
app.get('/resort-names', async function (req, res) {
    let resorts = [...RESORTS];

    // Extract resort names using map
    let resort_names = resorts.map(resort => resort.resort_name);

    // Send the array of resort names as the response
    res.send(resort_names);
});


/**
 * @description Endpoint for user login.
 * 
 * Validates the username and password against the database.
 * 
 * @route POST /login
 * @body {string} username - The username provided by the user.
 * @body {string} password - The password provided by the user.
 * @returns {string} Message indicating login success or failure.
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
 * @description Endpoint for user registration.
 * 
 * Checks if the username is available and creates a new account if it is.
 * 
 * @route POST /signing-up
 * @body {string} username - Desired username.
 * @body {string} password - Desired password.
 * @body {string} email - User's email address.
 * @returns {string} Message indicating sign-up success or failure.
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

/** Changing password and changing username */

app.post('/change-password', async function (req, res) {
    let msg = "";

    const username = req.body.username;
    const password = req.body.password;

    try {
        msg = await sql.setPassword(username, password);

    } catch (err) {
        console.error(err.message);
        msg = "Error changing password. Please try again later.";
    }

    res.send(msg);
});

app.post('/change-username', async function (req, res) {

    let msg = "";

    const username = req.body.username;
    const newUsername = req.body.newUsername;

    try {
        msg = await sql.setUsername(username, newUsername);
    } catch (err) {
        console.error(err.message);
        msg = "Error changing username. Please try again later.";
    }

    res.send(msg); 
});

/**
 * @description Endpoint for sending password recovery emails.
 * 
 * @route POST /send-recovery-email
 * @body {string} username - The username of the account to recover.
 */
app.post('/send-recovery-email', async (req, res) => {
    const { username } = req.body;

    // Check if the user exists
    const user = await sql.getEmail(username);
    if (user === "Username not found") {
        res.json({ error: 'User not found.' });
    }

    const token = await sql.generateToken(username);

    // Set up the email transporter using nodemailer
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Compose the recovery email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user,
        subject: 'Password Recovery',
        text: `Hello ${username},\n\n
        Please use the following token on the previous page to reset your password:\n\n
        The token will expire in 15 minutes.\n\n
        ${token}\n\n
        If you did not request this, please ignore this email.`,
    };

    // Send the recovery email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.json({ error: 'Error sending recovery email.' });
        }

        console.log('Recovery email sent:', info.response);
        res.json({ message: 'A recovery email has been sent to your email address.' });
    });
});


// Endpoint to handle recovery email requests
app.post('/reset-password', async (req, res) => {
    const { username, token, newPassword } = req.body;

    if (!username || !token || !newPassword) {
        return res.json({ error: 'Missing required fields.' });
    }

    try {
        const isValid = await sql.validateToken(username, token);
        if (!isValid) {
            return res.json({ error: 'Invalid or expired token.' });
        }

        await sql.setPassword(username, newPassword);

        res.json({ message: 'Password reset successfully.' });
    } catch (error) {
        console.error(error);
        res.json({ error: 'Internal server error.' });
    }
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
