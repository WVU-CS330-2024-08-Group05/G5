class Application {
    constructor() {
        this.user = new Map();
    }

    register(username, password) {
        if (this.user.has(username)) {
            console.log("Username already exists. Please choose a different username.");
            return false;
        }
        this.user.set(username, password);
        console.log("Registration successful!");
        return true;
    }

    login(username, password) {
        if (this.user.has(username) && this.user.get(username) === password) {
            console.log("Login successful!");
            return true;
        } else {
            console.log("Invalid username or password, please try again");
            return false;
        }
    }
}

// Main app logic
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const loginSystem = new Application();

console.log("Welcome to the Login System!");

function registerUser() {
    rl.question("Register a new user\nUsername: ", (newUsername) => {
        rl.question("Enter password: ", (newPassword) => {
            // Attempt registration
            const success = loginSystem.register(newUsername, newPassword);
            if (success) {
                loginUser();
            } else {
                registerUser(); // Prompt again if username already exists
            }
        });
    });
}

function loginUser() {
    rl.question("Login\nUsername: ", (username) => {
        rl.question("Enter password: ", (password) => {
            const success = loginSystem.login(username, password);
            if (success) {
                rl.close(); // Exit after successful login
            } else {
                loginUser(); // Retry login on failure
            }
        });
    });
}

// Start by registering a user
registerUser();
