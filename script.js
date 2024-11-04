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
const csvFilePath = 'resortdata.csv';

function loadResortData() {
    Papa.parse(csvFilePath, {
        download: true,
        header: true,
        complete: function(results) {
            console.log(results.data); // Log data for debugging
            const data = results.data;
            generateResortCards(data);
        },
        error: function(err) {
            console.error('Error loading CSV file:', err); // Error handling
        }
    });
}

function generateResortCards(resorts) {
    const resortList = document.querySelector('.resort-list');
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
    let errorMessage = isStrongPassword(password);
    let errorDiv = document.getElementById('error-message');
    
    if (username && errorMessage.length === 0) {
        errorDiv.innerHTML = "";

        window.location.href = 'home.html';

        // alert(`Welcome, ${username}!`);
    } else {
        errorDiv.innerHTML = errorMessage;
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