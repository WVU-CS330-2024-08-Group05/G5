/**
 * Server on http://localhost:8080
 */

const express = require('express');
const path = require('path');
const app = express();
const sql = require('mssql');
const RESORTS = require('./resortdata.json');
const NodeGeolocation = require('nodejs-geolocation').default;
const geo = new NodeGeolocation('App');

// serve files from root dir
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
    user: "cs330admin", // better stored in an app setting such as process.env.DB_USER
    password: "cs330Pass!", // better stored in an app setting such as process.env.DB_PASSWORD
    server: "cs3305.database.windows.net", // better stored in an app setting such as process.env.DB_SERVER
    database: "CS_330_5", // better stored in an app setting such as process.env.DB_NAME
    authentication: {
        type: 'default'
    },
    options: {
        encrypt: true
    }
}

console.log("Starting...");
// connectTest();

// /** 
//  * Query to test connection
// */

// async function connectTest() {
//     try {
//         var poolConnection = await sql.connect(config);

//         console.log("Connected Successfully");

//         // close connection only when we're certain application is finished
//         poolConnection.close();
//     } catch (err) {
//         console.error(err.message);
//     }
// }


/**
 * Search functionality
 * 
 * Search results include resorts with names that start with req.query.search and resorts that are in a state the the begins with req.query.search.
 */
app.get('/search.html', function (req, res) {
    resorts = [...RESORTS];
    options = {distance: false};
    if (req.query.search) {
        resorts = filterBySearch(resorts, req.query.search)
    }
    if (req.query.lat && req.query.lon && req.query.range) {
        resorts = filterByDistance(resorts, req.query, req.query.range);
        options.distance = true;
    }

    res.send(generateSearchHtml(resorts, options))
});

function generateSearchHtml(resorts, options) {
    let html = "";
    let distance = "";
    if (options.distance) resorts.sort(function (a, b) {
        if (a.distance < b.distance) return -1;
        else if (a.distance > b.distance) return 1;
        else return 0;
    });
    for (let resort of resorts) {
        if (options.distance) {
            distance = `<p>Distance: ${resort.distance} miles</p>`;
        }
        html = html.concat(
`<div class="resort-card">
    <h3>${resort.resort_name}</h3>
    <div class="resort-details">
        <img src=flags/Flag_of_${resort.state.replaceAll(' ', '_')}.svg alt="State Logo" height="120" width="120">
        <div class="piechart">[['Difficulty', 'Acres'], ['Green', ${resort.green_acres}], ['Blue', ${resort.blue_acres}], ['Black', ${resort.black_acres}]]</div >
        <div class="acreage-details">
        <p>Green Acres: ${resort.green_acres}<p>
        <p>Blue Acres: ${resort.blue_acres}<p>
        <p>Black Acres: ${resort.black_acres}<p>
        <p>Total Acres: ${resort.acres}<p>
        </div>
        <div class="other-resort-details">
        ${distance}
        </div>
        <div class="resort-rating">
            <p>Rating</p>
        </div>
    </div>
</div >
`
        );
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
        password_matches = await connectAndQueryPassword(password);
        msg = password_matches;
    }

    

    res.send(msg);
});


async function connectAndQueryUsername(username) {
    try {
        let poolConnection = await sql.connect(config);

        let msg = "Username not found"; // Default message

        // Run the query to fetch ID based on the username
        const resultSet = await poolConnection.request()
            .input('username', sql.VarChar, username) // Avoid SQL injections
            .query(`SELECT id FROM Accounts WHERE username COLLATE Latin1_General_BIN = @username`); // case-sensitive search

        // Check if any record was found in the database
        if (resultSet.recordset.length > 0) {
            msg = "User found"; // Username exists
        } 
        
        poolConnection.close();
        return msg;
        
    } catch (err) {
        console.error(err.message);
        return "Error checking username"; // Return a default error message in case of failure
    } 
}

async function connectAndQueryPassword(password) {
    try {
        let poolConnection = await sql.connect(config);

        let msg = "Password is incorrect"; // Default message

        // Run the query to find if the password is correct
        const resultSet = await poolConnection.request()
            .input('password', sql.VarChar, password) // avoid sql injections
            .query(`SELECT username FROM Accounts WHERE password COLLATE Latin1_General_BIN = @password`); // case-sensitive search
            // don't need to check by username, because this is only called when a username is found
            // therefore, if this function is run a password must either match or not

        // Check if any record was found in the database
        if (resultSet.recordset.length > 0) {
            msg = "Password is correct"; // Username exists
        } 
        
        poolConnection.close();
        return msg;
        
    } catch (err) {
        console.error(err.message);
        return "Error checking username"; // Return a default error message in case of failure
    } 
}
