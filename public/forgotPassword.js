/**
 * Executes once the DOM is fully loaded.
 * Adds event listeners for email input and send button.
 */
document.addEventListener("DOMContentLoaded", function () {
    /**
     * Validates the email and displays appropriate messages.
     * Sends a password reset email if the input is valid.
     */
    function sendEmail() {
        // Get the email input element
        const emailElement = document.getElementById("emailInput");
        const email = emailElement.value.trim();

        // Get the message container element
        const messageContainer = document.getElementById("emailMessage");

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Clear previous message
        messageContainer.textContent = "";

        if (emailRegex.test(email)) {
            console.log("Sending password reset email to: " + email);
            messageContainer.textContent = "Email sent";
            messageContainer.style.color = "green"; // Success message in green
        } else {
            console.log("Invalid email entered: " + email);
            messageContainer.textContent = "Please enter a valid email";
            messageContainer.style.color = "red"; // Error message in red
        }
    }

    /**
     * Handles the Enter keypress event on the email input field.
     * @param {KeyboardEvent} event - The keydown event object.
     */
    document.getElementById("emailInput").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent the default form submission
            sendEmail(); // Call the sendEmail function
        }
    });

    /**
     * Handles the click event on the "Send Email" button.
     */
    document.getElementById("sendEmailButton").addEventListener("click", sendEmail);
});
