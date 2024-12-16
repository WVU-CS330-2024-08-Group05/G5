
async function getNames() {
    const baseUrl = 'http://localhost:8080';
    const url = baseUrl + '/resort-names';
    console.log(`Getting from ${url}...`);
    const response = await fetch('http://localhost:8080/resort-names');

    // Check if the response is successful
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the JSON response
    const resorts = await response.json();

    // creates the select button to append to
    const selectElement = document.getElementById('Resort');

    // Loop through the array and create option elements
    resorts.forEach(resort => {
        const option = document.createElement('option');
        option.value = resort;    // Set the option value
        option.textContent = resort; // Set the display text
        selectElement.appendChild(option);
    });
    
}

document.addEventListener('DOMContentLoaded', function () {
    getNames();
});