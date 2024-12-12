/**
 * Server on http://localhost:8080
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const sql = require('mssql');
const bcrypt = require('bcrypt');
const RESORTS = require('./resortdata.json');
const NodeGeolocation = require('nodejs-geolocation').default;
const geo = new NodeGeolocation('App');
const Weather = require('./weather.js');
const ResortCard = require('./ResortCard.js');

MAX_RESULTS = 10;

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
 * Connect to Database
 */
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Enables encryption for Azure SQL
        enableArithAbort: true,
    },
};


// establishing a persistent pool connection
let poolConnection;

async function initializePool() {
    let retries = 5; // Set a retry limit
    while (retries > 0) {
        try {
            poolConnection = await sql.connect(config);
            console.log('Database connected');
            break;
        } catch (err) {
            console.error('Database connection error:', err.message);
            retries--;
            if (retries === 0) {
                throw new Error("Failed to connect to the database after multiple attempts.");
            }
            console.log(`Retrying connection in 5 seconds... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

// Initial connection attempt
initializePool();


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
    try {
        // Get search results html
        const html = await getSearchResultsHtml(resorts, options);
        res.send(html);
    } catch (err) {
        res.send(`<h2>I'm not in the mood right now, please try again...<h2>`);
        console.error(err);
    }
});

async function getSearchResultsHtml(resorts, options) {
    let html = "";
    // Sort resorts by distance from location
    if (options.distance) {
        resorts.sort((a, b) => a.distance - b.distance);
    }

    // Create results HTML
    for (let i = 0; i < MAX_RESULTS && i < resorts.length; ++i) {
        const resort = resorts[i];
        const cardHtml = await ResortCard.html(resort, options); // Await the card HTML
        html = html + cardHtml; // Append to accumulated HTML
    }
    return html;
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

    let username_exists = await connectAndQueryUsername(username);
    let password_matches;

    msg = username_exists;

    if (username_exists === "User found") {
        password_matches = await connectAndQueryPassword(username, password);
        msg = password_matches;
    }

    res.send(msg);
});


async function connectAndQueryUsername(username) {
    try {
        
        const query = `SELECT id FROM Accounts WHERE username COLLATE Latin1_General_BIN = @username`;
        const inputs = [{ name: 'username', type: sql.VarChar, value: username }];
        const resultSet = await executeQuery(query, inputs);

        return resultSet.recordset.length > 0 ? "User found" : "Username not found";
    } catch (err) {
        console.error('Username query error:', err.message);
        return err.message;
    }
}

async function connectAndQueryPassword(username, password) {
    try {
        const query = `SELECT password AS hash FROM Accounts WHERE username COLLATE Latin1_General_BIN = @username`;
        const inputs = [{ name: 'username', type: sql.VarChar, value: username }];
        const resultSet = await executeQuery(query, inputs);

        // Check if a matching record was found
        if (resultSet.recordset.length > 0) {
            const hash = resultSet.recordset[0].hash;

            // Compare provided password with hashed password
            const isMatch = await isPasswordCorrect(password, hash);
            return isMatch ? "Password is correct" : "Password is incorrect";
        } else {
            return "Password is incorrect"; // User not found or wrong password
        }
    } catch (err) {
        console.error(err.message);
        return "Error checking password";
    }
}

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
        const usernameExists = await connectAndQueryUsername(username);

        if (usernameExists === "User found") {
            msg = "Username taken";
        } else {
            // Proceed with creating account
            msg = await connectAndInsertAccount(username, password, email); // Password hashing happens in connectAndInsertAccount
        }
    } catch (err) {
        console.error(err.message);
        msg = "Error signing up. Please try again later.";
    }

    res.send(msg);
});


async function connectAndInsertAccount(username, password, email) {
    try {
        const hashedPassword = await hashPassword(password); // Hash the password

        const query = `
            INSERT INTO Accounts (username, password, email, settings, pinned_resorts, trips)
            VALUES (@username, @hashedPassword, @email, NULL, NULL, NULL) `; // empty jsons
        const inputs = [
            { name: 'username', type: sql.VarChar, value: username },
            { name: 'hashedPassword', type: sql.VarChar, value: hashedPassword },
            { name: 'email', type: sql.VarChar, value: email }
        ];
        const resultSet = await executeQuery(query, inputs);

        // Check if the insert was successful
        return resultSet.rowsAffected[0] > 0 ? "Account created successfully" : "Account creation failed";
    } catch (err) {
        console.error(err.message);
        return "Error creating account";
    }
}

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
        msg = await connectAndQueryTrips(username);
    } catch (err) {
        console.error(err.message);
        msg = { error: "Error retrieving trips. Please try again later." }; // Send error as JSON
    }

    res.json(msg); // Ensure response is always JSON
});


async function connectAndQueryTrips(username) {
    let msg = null;

    const query = `SELECT trips FROM Accounts WHERE username COLLATE Latin1_General_BIN = @username`;
    const input = [{ name: 'username', type: sql.VarChar, value: username }];
    const resultSet = await executeQuery(query, input);

    if (resultSet.recordset && resultSet.recordset.length > 0) {
        const tripsString = resultSet.recordset[0].trips;

        // Ensure `tripsString` is valid JSON
        if (tripsString) {
            try {
                const trips = JSON.parse(tripsString); // Parse JSON
                msg = trips; // Assign parsed JSON to msg
            } catch (error) {
                console.error("Failed to parse JSON from database:", error);
                msg = []; // Return empty array on parsing failure
            }
        } else {
            msg = []; // Handle null or empty trips column
        }
    } else {
        msg = []; // No records found
    }
    return msg;
}


app.post("/store-trips", async function (req, res) {
    let msg = "Storing account failed";  // Default error message
    const username = req.body.username;
    const trips = req.body.trips;

    if (!username || !trips) {
        msg = "Username and trips are required.";
        return res.send(msg);
    }

    try {
        msg = await connectAndUpdateTrips(username, trips);
    } catch (err) {
        console.error('Error storing trips:', err);
        msg = 'Failed to store trips in the database.';
    }

    res.send(msg);
});


async function connectAndUpdateTrips(username, trips) {
    const query = `UPDATE Accounts SET trips = @trips WHERE username = @username`;
    const input = [
        { name: 'username', type: sql.VarChar, value: username },
        { name: 'trips', type: sql.NVarChar, value: typeof trips === 'string' ? trips : JSON.stringify(trips) }
        // Ensure trips is stringified only if it's not already a string
    ];

    try {
        await executeQuery(query, input);
        return 'Trips successfully stored';
    } catch (err) {
        console.error('Error in connectAndUpdateTrips:', err);
        return 'Failed to update trips';
    }
}

/** Query helper functions */

async function executeQuery(query, inputs = []) {
    if (!poolConnection) {
        throw new Error("Database connection is not initialized.");
    }
    try {
        const request = poolConnection.request();
        inputs.forEach(({ name, type, value }) => {
            request.input(name, type, value);
        });

        return await request.query(query);
    } catch (err) {
        console.error('Database query error:', err.message);
        throw err; // Throw to handle error higher up
    }
}


async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

async function isPasswordCorrect(password, hash) {
    return await bcrypt.compare(password, hash);
}

