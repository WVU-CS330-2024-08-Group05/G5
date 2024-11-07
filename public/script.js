/*All Pages*/
    //dark mode
if(Account.darkMode){
    document.body.classList.toggle('dark-mode');
}


/*Account*/
const darkModeToggle = document.getElementById('darkModeToggle');

darkModeToggle.addEventListener('click', () => {

    document.body.classList.toggle('dark-mode');
    Account.changeBrowserMode();

});

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


/*SignUp*/

function signUp() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let email = document.getElementById('email').value;

    let emailErrorDiv = document.getElementById('email-error');
    let passwordErrorDiv = document.getElementById('password-error');

    // Clear previous error messages
    emailErrorDiv.innerHTML = "";
    passwordErrorDiv.innerHTML = "";

    // Validate email and password
    // Assume it returns an error message if invalid, else ""
    let emailResult = isEmail(email);  
    let passwordErrorMessage = isStrongPassword(password);  

    let hasError = false;

    // Display email error if invalid
    if (!emailResult.isValid) {
        emailErrorDiv.innerHTML = emailResult;
        hasError = true;
    }

    // Display password error if invalid
    if (passwordErrorMessage) {
        passwordErrorDiv.innerHTML = passwordErrorMessage;
        hasError = true;
    }

    if (!hasError && username) {
        // Redirect if no errors
        window.location.href = 'home.html';
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
   
    if(!emailRegex.test(email)){
        error += "Must be a valid email.<br>"
    }
    
    return error;

}




/*SkiLogger*/

document.getElementById('hourSubmit').addEventListener("click", function () {
    // Adds hours to total
    let newHours = parseFloat(document.getElementById('Hours').value) || 0;
    let totalHours = parseFloat(document.getElementById('totalHours').value) || 0;
    totalHours += newHours;
    document.getElementById('totalHours').value = totalHours;
    document.getElementById('total-hours').innerText = ("Total Hours: " + totalHours);
    document.getElementById('Hours').value = 0;

    // Adds new Ski Trip to list which will be posted on right
    // hand side of the web page
    let resort = document.getElementById('Resort').value;
    let date = document.getElementById('Date').value;
    let listItem = document.createElement('li');
    listItem.textContent = ("Trip to " + resort + " on " + date + ", for " + newHours + " hours");
    document.getElementById('SkiTripList').append(listItem);
    // update user Info

    // These dont work yet
    //trips +=1;
});
document.addEventListener('DOMContentLoaded', function () {
    //set user info
   // document.getElementById('rank').textContent = ("Global Rank: " + 1); // Placeholder
    document.getElementById('total-hours').textContent = ("Total Hours: " + 0); 
    //document.getElementById('total-trips').textContent = ("Total Trips: " + 0);Implement Later
});

// Search functionality
//$('#searchButton').on('click', function (event) {
//    let state = $('#search-bar').value();
//    let url = new URL('./search.html')
//    fetch(url, function(reps)
//})