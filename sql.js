/**
 * Database functionality
 */

const bcrypt = require('bcrypt');
const mssql = require('mssql');

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
            poolConnection = await mssql.connect(config);
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

async function getId(username) {
    try {

        const query = `SELECT id FROM Accounts WHERE username COLLATE Latin1_General_BIN = @username`;
        const inputs = [{ name: 'username', type: mssql.VarChar, value: username }];
        const resultSet = await executeQuery(query, inputs);

        return resultSet.recordset.length > 0 ? "User found" : "Username not found";
    } catch (err) {
        console.error('Username query error:', err.message);
        return err.message;
    }
}

async function getPassword(username, password) {
    try {
        const query = `SELECT password AS hash FROM Accounts WHERE username COLLATE Latin1_General_BIN = @username`;
        const inputs = [{ name: 'username', type: mssql.VarChar, value: username }];
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

async function setPassword(username, password) {
    try {
        
        const hashedPassword = await hashPassword(password); 
        
        const query = `
            UPDATE Accounts 
            SET password = @hashedPassword 
            WHERE username = @username`; // update the existing password instead of inserting a new row
        const inputs = [
            { name: 'username', type: mssql.VarChar, value: username },
            { name: 'hashedPassword', type: mssql.VarChar, value: hashedPassword },
        ];
        const resultSet = await executeQuery(query, inputs);

        return resultSet.rowsAffected[0] > 0 ? "Password changed successfully" : "Password change failed";
    } catch (err) {
        console.error(err.message);
        return "Error changing password";
    }
}


async function setUsername(username, newUsername){
    try {

        const available = await getId(newUsername);

        if(available === "Username not found") {
            const query = `
                UPDATE Accounts
                SET username = @newUsername
                WHERE username = @username`; 
            const inputs = [
                { name: 'username', type: mssql.VarChar, value: username },
                { name: 'newUsername', type: mssql.VarChar, value: newUsername },
            ];
            const resultSet = await executeQuery(query, inputs);
            
            console.log(resultSet);

            // Check if the insert was successful
            return resultSet.rowsAffected[0] > 0 ? "Username changed successfully" : "Username change failed";
        } else {
            return "Username taken"
        }
    } catch (err) {
        console.error(err.message);
        return "Error changing password";
    }
}

async function creatAccount(username, password, email) {
    try {
        const hashedPassword = await hashPassword(password); // Hash the password

        const query = `
            INSERT INTO Accounts (username, password, email, settings, pinned_resorts, trips)
            VALUES (@username, @hashedPassword, @email, NULL, NULL, NULL) `; // empty jsons
        const inputs = [
            { name: 'username', type: mssql.VarChar, value: username },
            { name: 'hashedPassword', type: mssql.VarChar, value: hashedPassword },
            { name: 'email', type: mssql.VarChar, value: email }
        ];
        const resultSet = await executeQuery(query, inputs);

        // Check if the insert was successful
        return resultSet.rowsAffected[0] > 0 ? "Account created successfully" : "Account creation failed";
    } catch (err) {
        console.error(err.message);
        return "Error creating account";
    }
}

async function getTrips(username) {
    let msg = null;

    const query = `SELECT trips FROM Accounts WHERE username COLLATE Latin1_General_BIN = @username`;
    const input = [{ name: 'username', type: mssql.VarChar, value: username }];
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

async function setTrips(username, trips) {
    const query = `UPDATE Accounts SET trips = @trips WHERE username = @username`;
    const input = [
        { name: 'username', type: mssql.VarChar, value: username },
        { name: 'trips', type: mssql.NVarChar, value: typeof trips === 'string' ? trips : JSON.stringify(trips) }
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

module.exports = {
    creatAccount,
    setUsername,
    getId,
    getPassword,
    setPassword,
    getTrips,
    setTrips,
    executeQuery
}