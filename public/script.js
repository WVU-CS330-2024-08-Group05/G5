/*Account*/
// display account username on Account page and Skilogger page
if (window.location.pathname.endsWith('skilogger.html') || window.location.pathname.endsWith('account.html') || window.location.pathname === '/') {
    window.addEventListener('pageshow', function () {
        accountUsername();
    });
}

function accountUsername(){
    const username = sessionStorage.getItem("username");
    document.getElementById("username-written").innerHTML = username;
}

// Dark mode
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('darkModeToggle');

    // Check localStorage and apply saved mode
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
    }

    // Toggle dark mode on button click
    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');

        // Save preference in localStorage
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    });
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


// Search functionality
//$('#searchButton').on('click', function (event) {
//    let state = $('#search-bar').value();
//    let url = new URL('./search.html')
//    fetch(url, function(reps)
//})


