class Application {
    constructor() {
        this.user = new Map();
    }

    register(username, password) {
        this.user.set(username, password);
        console.log("Registration successful!");
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

// Example usage
const app = new Application();
app.register("user1", "password123");
app.login("user1", "password123");
app.login("user1", "wrongPassword");
