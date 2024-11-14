/**
 * Server on http://localhost:8080
 */

const express = require('express');
const path = require('path');
const app = express();
const sql = require('mssql');
const bcrypt = require('bcrypt');
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
        password_matches = await connectAndQueryPassword(username, password);
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

async function connectAndQueryPassword(username, password) {
    try {
        let poolConnection = await sql.connect(config);

        let msg = "Password is incorrect"; // Default message

        // Run the query to find if the password is correct
        const resultSet = await poolConnection.request()
            .input('username', sql.VarChar, username) // Avoid SQL injections
            .query(`SELECT password AS hash FROM Accounts WHERE username COLLATE Latin1_General_BIN = @username`); // Case-sensitive search
    
        // Check if any record was found in the database
        if (resultSet.recordset.length > 0) {
            let hash = resultSet.recordset[0].hash;

            // Compare password with the hashed password
            const isMatch = await bcrypt.compare(password, hash);
            if (isMatch) {
                msg = "Password is correct";
            }
        }

        poolConnection.close();
        return msg;
        
    } catch (err) {
        console.error(err.message);
        return "Error checking username"; // Return a default error message in case of failure
    } 
}

/**
 * Sign Up functionality
 */

app.post("/signing-up.html", async function (req, res) {
   
    let msg = "";

    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;


    // check if username is already taken
    let username_exists = await connectAndQueryUsername(username);
    if(username_exists === "User found") {
        msg = "Username taken."
    } 
    // if username not taken, proceed with creating account
    else {
    
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                
                msg = connectAndInsertAccount(username, hash, email);
                
                // error handling
                if(err) {
                    console.error(err);
                }
            });
            // error handling
            if(err) {
                console.error(err);
            }
        });

    }
    

    res.send(msg);
});

async function connectAndInsertAccount(username, hashedPassword, email) {
    try {
        let poolConnection = await sql.connect(config);

        let msg = "Account creation failed" // default msg

        // Run the query to insert new account
        const resultSet = await poolConnection.request()
        .input('username', sql.VarChar, username)
        .input('hashedPassword', sql.VarChar, hashedPassword)
        .input('email', sql.VarChar, email)
        .query(`INSERT INTO Accounts (username, password, email, settings, pinned_resorts, trips)
                VALUES (@username, @hashedPassword, @email, NULL, NULL, NULL)`);
        
        // checking if an insert was made
        if (resultSet.rowsAffected[0] > 0) {
            msg = "Account created successfully"
        }

        poolConnection.close();
        return msg;
    } catch (err) {
        console.error(err)
    }
}
