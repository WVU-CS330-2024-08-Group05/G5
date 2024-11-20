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
const W = require('./weather.js')

MAX_RESULTS = 10;

// serve files from public dir
app.use(express.static('public'));


app.listen(8080, function () {
    console.log('Listening on port 8080...');
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

(async function initializePool() {
    try {
        poolConnection = await sql.connect(config);
        console.log('Database connected');
    } catch (err) {
        console.error('Error connecting to database:', err.message);
    }
})();


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
    // Get search results html
    let html = await getSearchResultHtml(resorts, options);
    res.send(html)
});

async function getSearchResultHtml(resorts, options) {
    let html = "";
    // Sort resorts by distance from location
    if (options.distance) {
        resorts.sort((a, b) => a.distance - b.distance);
    }

    // Create results HTML
    for (let i = 0; i < MAX_RESULTS && i < resorts.length; ++i) {
        const resort = resorts[i];
        const cardHtml = await getResortCardHtml(resort, options); // Await the card HTML
        html += cardHtml; // Append to accumulated HTML
    }
    return html;
}


async function getResortCardHtml(resort, options) {
    // Set distance html
    let distance = "";
    if (options.distance) {
        distance = `<p>Distance: ${resort.distance} miles</p>`;
    }
    // Get array of weekdays, starting with Today
    let week_days = getWeekDays();
    // Get weather data (12-hour)
    let weather = await W.getResortWeather(resort);
    
    html =
`<div class="resort-card">
    <input id="pin-button" class="pin-button" type="image" src="pin-image.png"/>
    <h3>${resort.resort_name}</h3>
    <div class="resort-details">
        <img src=flags/Flag_of_${resort.state.replaceAll(' ', '_')}.svg alt="State Logo" height="120" width="120">
        <div class="piechart">[['Difficulty', 'Acres'], ['Green', ${resort.green_acres}], ['Blue', ${resort.blue_acres}], ['Black', ${resort.black_acres}]]</div >
        <div class="acreage-details">
        <table>
            <tr>
                <th>${week_days[0]}
                <th>${week_days[1]}
                <th>${week_days[2]}
                <th>${week_days[3]}
                <th>${week_days[4]}
                <th>${week_days[5]}
                <th>${week_days[6]}
            </tr>
            <tr>
                <td>${weather[0].temperature}
                <td>${weather[2].temperature}
                <td>${weather[4].temperature}
                <td>${weather[6].temperature}
                <td>${weather[8].temperature}
                <td>${weather[10].temperature}
                <td>${weather[12].temperature}
            </tr>
        </table>
        </div>
        <div class="other-resort-details">
        <p>Total Acres: ${resort.acres}<p>
        ${distance}
        </div>
        <div class="resort-rating">
            <p>Rating</p>
        </div>
    </div>
</div >
`
return html
}

function getWeekDays() {
    let weekDays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ];
    let date = new Date();
    let day = date.getDay();
    let week_array = [];
    for (i = 0; i < 7; ++i) {
        week_array.push(weekDays[(day + i) % 7]);
    }
    week_array[0] = "Today";
    return week_array;
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


/**  Login Functionality 
 * 
 * check if username is in database, then check if password matches
*/

app.post('/logging-in.html', async function (req, res) {
    let msg = "";

    let username = req.body.username;
    let password = req.body.password;
    
    let username_exists = await connectAndQueryUsername(username);
    let password_matches;

    msg = username_exists;

    if(username_exists === "User found") {
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
    } catch {
        return "Error checking username";
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

app.post("/signing-up.html", async function (req, res) {
    let msg = "";

    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;

    try {
        // Check if username is already taken
        const usernameExists = await connectAndQueryUsername(username);

        if (usernameExists === "User found") {
            msg = "Username taken.";
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
            VALUES (@username, @hashedPassword, @email, NULL, NULL, NULL)
        `;
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

async function executeQuery(query, inputs = []) {
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