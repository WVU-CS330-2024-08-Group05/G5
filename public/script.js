

/*All Pages*/
    //dark mode
// if(Account.darkMode){
//     document.body.classList.toggle('dark-mode');
// }


// /*Account*/
// const darkModeToggle = document.getElementById('darkModeToggle');

// darkModeToggle.addEventListener('click', () => {

//     document.body.classList.toggle('dark-mode');
//     Account.changeBrowserMode();

// });





/*Home*/
function generateResortCards(resorts) {
    const resortList = document.querySelector('#searchResults');
    resortList.innerHTML = ''; // Clear any existing content

    resorts.forEach(resort => {
        // Create a new resort card
        const resortCard = document.createElement('div');
        resortCard.classList.add('resort-card');

        // Create the resort logo section
        const resortLogo = document.createElement('div');
        resortLogo.classList.add('resort-logo');
        resortLogo.innerHTML = `<img src="logo-placeholder.png" alt="Resort Logo">`;

        // Create the resort details section
        const resortDetails = document.createElement('div');
        resortDetails.classList.add('resort-details');
        resortDetails.innerHTML = `
            <h2><a href="#PLACEHOLDER">${resort.resort_name}</a></h2>
            <p>Location: ${resort.state}</p>
        `;

        // Create the resort rating section
        const resortRating = document.createElement('div');
        resortRating.classList.add('resort-rating');
        resortRating.innerHTML = `<p>Rating</p>`;

        // Append all sections to the resort card
        resortCard.appendChild(resortLogo);
        resortCard.appendChild(resortDetails);
        resortCard.appendChild(resortRating);

        // Append the resort card to the resort list
        resortList.appendChild(resortCard);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadResortData();
});

/* Sign Up */

function signUp() {
    let username = $('#username').val();
    let password = $('#password').val();
    let email = $('#email').val();

    let emailErrorDiv = $('#email-error');
    let passwordErrorDiv = $('#password-error');

    // Clear previous error messages
    emailErrorDiv.html("");
    passwordErrorDiv.html("");

    // Validate email and password
    let emailResult = isEmail(email);  
    let passwordErrorMessage = isStrongPassword(password);  

    let hasError = false;

    // Display email error if invalid
    if (emailResult) {
        emailErrorDiv.html(emailResult);
        hasError = true;
    }

    // Display password error if invalid
    if (passwordErrorMessage) {
        passwordErrorDiv.html(passwordErrorMessage);
        hasError = true;
    }

    if (!hasError && username) {
        window.location.href = 'index.html';  // Redirect on success
    }
}


function isStrongPassword(password) {
    let error = "";
    if (password.length < 8) {
        error += "Password needs to be more than 8 characters.<br>";
    }
    if (!/[A-Z]/.test(password)) {
        error += "Password needs to have a capital letter.<br>";
    }
    return error;
}

function isEmail(email) {
    let error = "";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        error += "Must be a valid email.<br>";
    }
    return error;
}

document.addEventListener('DOMContentLoaded', function () {
    //set user info
    document.getElementById('rank').textContent = ("Global Rank: " + 1);
    document.getElementById('total-hours').textContent = ("Total Hours: " + 0);
    document.getElementById('total-trips').textContent = ("Total Trips: " + trips);
});

// Search functionality
//$('#searchButton').on('click', function (event) {
//    let state = $('#search-bar').value();
//    let url = new URL('./search.html')
//    fetch(url, function(reps)
//})