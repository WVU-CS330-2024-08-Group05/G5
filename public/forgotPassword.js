document.addEventListener("DOMContentLoaded", function () {
    function sendEmail() {
        const emailElement = document.getElementById("emailInput");
        const email = emailElement.value.trim();
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

    // Add keydown event listener for Enter key
    document.getElementById("emailInput").addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent the default form submission
            sendEmail(); // Call the sendEmail function
        }
    });

    // Add click event listener to the submit button
    document.getElementById("sendEmailButton").addEventListener("click", sendEmail);
});
