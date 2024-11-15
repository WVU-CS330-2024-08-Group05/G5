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
    
    const loginButton = document.querySelector('.login-button');
    const signupButton = document.querySelector('.signup-button');
    const accountButton = document.querySelector('.account-button');
    const skiLoggerButton = document.querySelector('.skilogger-button');
    
    loginButton.style.display = isGuest ? 'inline-block' : 'none';
    signupButton.style.display = isGuest ? 'inline-block' : 'none';
    accountButton.style.display = isGuest ? 'none' : 'inline-block';
    skiLoggerButton.style.display = isGuest ? 'none' : 'inline-block';
}

if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', isGuest);
    window.addEventListener('pageshow', function () {
        isGuest();
    });
}
