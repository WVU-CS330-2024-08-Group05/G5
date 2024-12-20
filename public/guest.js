/* Guest */

function isGuest() {
    // Set default to guest if not yet defined
    if (sessionStorage.getItem("isGuest") === null) {
        sessionStorage.setItem("isGuest", "true");
    }

    // Adjust the UI based on guest status
    toggleGuestButtons();
}

function toggleGuestButtons() {
    const isGuest = sessionStorage.getItem("isGuest") === "true";

    const loginButton = document.querySelector('#login-nav');
    const signupButton = document.querySelector('#signup-nav');
    const accountButton = document.querySelector('#account-nav');
    const skiLoggerButton = document.querySelector('#skilogger-nav');

    loginButton.style.display = isGuest ? 'inline-block' : 'none';
    signupButton.style.display = isGuest ? 'inline-block' : 'none';
    accountButton.style.display = isGuest ? 'none' : 'inline-block';
    skiLoggerButton.style.display = isGuest ? 'none' : 'inline-block';
}

document.addEventListener('DOMContentLoaded', isGuest);
window.addEventListener('pageshow', function () {
    isGuest();
});
