/**
 * Database functionality for user management and operations, including authentication,
 * account creation, trip storage, and updates to user details.
 */

const bcrypt = require('bcrypt');
const mssql = require('mssql');
const crypto = require('crypto');

/**
 * Database configuration object for connecting to the SQL database.
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

// Persistent database connection pool
let poolConnection;

/**
 * Initializes a persistent connection pool with retry logic.
 * Retries up to 5 times if the connection fails, waiting 5 seconds between attempts.
 * @throws {Error} If the database connection fails after multiple attempts.
 */
async function initializePool() {
    let retries = 5;
    while (retries > 0) {
        try {
            // attempt to create a connection with the database
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

// Initialize the connection pool on module load
initializePool();

/**
 * Checks if a username exists in the database.
 * @param {string} username - The username to check.
 * @returns {Promise<string>} "User found" if the username exists, "Username not found" otherwise.
 * @throws {Error} If the query fails.
 */
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

/**
 * @description Retrieves the email address associated with a given username from the database.
 * 
 * @param {string} username - The username of the account for which to retrieve the email.
 * @returns {Promise<string>} A promise that resolves to the email address if found, 
 *                            "Username not found" if the username does not exist, 
 *                            or an error message if a query error occurs.
 * 
 * @throws Will log an error to the console if the database query fails.
 */
async function getEmail(username) {
    try {
        const query = `SELECT email FROM Accounts WHERE username COLLATE Latin1_General_BIN = @username`;
        const inputs = [{ name: 'username', type: mssql.VarChar, value: username }];
        const resultSet = await executeQuery(query, inputs);

        return resultSet.recordset.length > 0 ? resultSet.recordset[0].email : "Username not found";
    } catch (err) {
        console.error('Username query error:', err.message);
        return err.message;
    }
}


/**
 * Verifies if a provided password matches the stored hash for a username.
 * @param {string} username - The username to verify.
 * @param {string} password - The password to verify.
 * @returns {Promise<string>} "Password is correct" or "Password is incorrect".
 * @throws {Error} If the query fails.
 */
async function getPassword(username, password) {
    try {
        const query = `SELECT password AS hash FROM Accounts WHERE username COLLATE Latin1_General_BIN = @username`;
        const inputs = [{ name: 'username', type: mssql.VarChar, value: username }];
        const resultSet = await executeQuery(query, inputs);

        if (resultSet.recordset.length > 0) {
            const hash = resultSet.recordset[0].hash;
            const isMatch = await isPasswordCorrect(password, hash);
            return isMatch ? "Password is correct" : "Password is incorrect";
        } else {
            return "Password is incorrect";
        }
    } catch (err) {
        console.error(err.message);
        return "Error checking password";
    }
}

/**
 * Updates the password for a user.
 * @param {string} username - The username whose password will be updated.
 * @param {string} password - The new password.
 * @returns {Promise<string>} Success or failure message.
 * @throws {Error} If the query fails.
 */
async function setPassword(username, password) {
    try {
        const hashedPassword = await hashPassword(password);
        const query = `
            UPDATE Accounts 
            SET password = @hashedPassword 
            WHERE username = @username`;
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

/**
 * Updates the username for a user.
 * @param {string} username - The current username.
 * @param {string} newUsername - The new username to set.
 * @returns {Promise<string>} Success, failure, or username taken message.
 * @throws {Error} If the query fails.
 */
async function setUsername(username, newUsername) {
    try {
        const available = await getId(newUsername);

        if (available === "Username not found") {
            const query = `
                UPDATE Accounts
                SET username = @newUsername
                WHERE username = @username`;
            const inputs = [
                { name: 'username', type: mssql.VarChar, value: username },
                { name: 'newUsername', type: mssql.VarChar, value: newUsername },
            ];
            const resultSet = await executeQuery(query, inputs);

            return resultSet.rowsAffected[0] > 0 ? "Username changed successfully" : "Username change failed";
        } else {
            return "Username taken";
        }
    } catch (err) {
        console.error(err.message);
        return "Error changing username";
    }
}

/**
 * Creates a new account with a hashed password and default values for optional fields.
 * @param {string} username - The username for the account.
 * @param {string} password - The password for the account.
 * @param {string} email - The email address for the account.
 * @returns {Promise<string>} Success or failure message.
 * @throws {Error} If the query fails.
 */
async function creatAccount(username, password, email) {
    try {
        const hashedPassword = await hashPassword(password);
        const query = `
            INSERT INTO Accounts (username, password, email, pinned_resorts, trips, reset_token, token_expiry)
            VALUES (@username, @hashedPassword, @email, NULL, NULL, NULL, NULL)`;
        const inputs = [
            { name: 'username', type: mssql.VarChar, value: username },
            { name: 'hashedPassword', type: mssql.VarChar, value: hashedPassword },
            { name: 'email', type: mssql.VarChar, value: email },
        ];
        const resultSet = await executeQuery(query, inputs);

        return resultSet.rowsAffected[0] > 0 ? "Account created successfully" : "Account creation failed";
    } catch (err) {
        console.error(err.message);
        return "Error creating account";
    }
}

/**
 * Retrieves the trips array for a user.
 * @param {string} username - The username whose trips will be retrieved.
 * @returns {Promise<Array>} The trips array or an empty array if none exist.
 * @throws {Error} If the query fails or JSON parsing fails.
 */
async function getTrips(username) {
    try {
        const query = `SELECT trips FROM Accounts WHERE username COLLATE Latin1_General_BIN = @username`;
        const inputs = [{ name: 'username', type: mssql.VarChar, value: username }];
        const resultSet = await executeQuery(query, inputs);

        if (resultSet.recordset.length > 0) {
            const tripsString = resultSet.recordset[0].trips;
            return tripsString ? JSON.parse(tripsString) : [];
        } else {
            return [];
        }
    } catch (err) {
        console.error('Error retrieving trips:', err.message);
        return [];
    }
}

/**
 * Updates the trips array for a user.
 * @param {string} username - The username whose trips will be updated.
 * @param {Array|string} trips - The trips array or JSON string to store.
 * @returns {Promise<string>} Success or failure message.
 * @throws {Error} If the query fails.
 */
async function setTrips(username, trips) {
    try {
        const query = `UPDATE Accounts SET trips = @trips WHERE username = @username`;
        const inputs = [
            { name: 'username', type: mssql.VarChar, value: username },
            { name: 'trips', type: mssql.NVarChar, value: typeof trips === 'string' ? trips : JSON.stringify(trips) },
        ];
        const resultSet = await executeQuery(query, inputs);

        return 'Trips successfully stored';
    } catch (err) {
        console.error('Error in setTrips:', err.message);
        return 'Failed to update trips';
    }
}

/**
 * Executes a parameterized SQL query.
 * @param {string} query - The SQL query string.
 * @param {Array<Object>} inputs - Array of input objects { name, type, value }.
 * @returns {Promise<Object>} The query result set.
 * @throws {Error} If the query fails.
 */
async function executeQuery(query, inputs = []) {
    if (!poolConnection) {
        throw new Error("Database connection is not initialized.");
    }
    try {
        const request = poolConnection.request();
        inputs.forEach(({ name, type, value }) => request.input(name, type, value));
        return await request.query(query);
    } catch (err) {
        console.error('Database query error:', err.message);
        throw err;
    }
}

/**
 * Hashes a password using bcrypt.
 * @param {string} password - The plaintext password.
 * @returns {Promise<string>} The hashed password.
 */
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

/**
 * Compares a plaintext password with a hashed password.
 * @param {string} password - The plaintext password.
 * @param {string} hash - The hashed password.
 * @returns {Promise<boolean>} True if the password matches the hash, false otherwise.
 */
async function isPasswordCorrect(password, hash) {
    return await bcrypt.compare(password, hash);
}


/**
 * @description Generates a secure token for password recovery and stores it in the database with an expiry time.
 * 
 * @param {string} username - The username of the account for which to generate the token.
 * @returns {Promise<string>} A promise that resolves to the generated token.
 * 
 * @throws Will throw an error if the database query fails.
 */
async function generateToken(username) {
    const token = crypto.randomBytes(32).toString('hex'); // Generate a secure token
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // Token expires in 15 minutes

    const query = `
        UPDATE Accounts
        SET reset_token = @token, token_expiry = @expiry
        WHERE username = @username`;
    const inputs = [
        { name: 'username', type: mssql.VarChar, value: username },
        { name: 'token', type: mssql.VarChar, value: token },
        { name: 'expiry', type: mssql.DateTime, value: expiry },
    ];

    await executeQuery(query, inputs);
    return token;
}

/**
 * @description Validates a password recovery token for a given username by checking if it matches and is not expired.
 * 
 * @param {string} username - The username of the account to validate the token for.
 * @param {string} token - The token to validate.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the token is valid, otherwise `false`.
 * 
 * @throws Will throw an error if the database query fails.
 */
async function validateToken(username, token) {
    const query = `
        SELECT reset_token, token_expiry
        FROM Accounts
        WHERE username = @username`;
    const inputs = [{ name: 'username', type: mssql.VarChar, value: username }];

    const resultSet = await executeQuery(query, inputs);

    if (resultSet.recordset.length === 0) {
        return false;
    }

    const { reset_token, token_expiry } = resultSet.recordset[0];
    // Check if the token matches and has not expired
    return reset_token === token && new Date() < new Date(token_expiry);
}


module.exports = {
    creatAccount,
    setUsername,
    getId,
    getEmail,
    getPassword,
    setPassword,
    getTrips,
    setTrips,
    executeQuery,
    generateToken,
    validateToken
};
