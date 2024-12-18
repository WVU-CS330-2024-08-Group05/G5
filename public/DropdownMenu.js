document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Fetch resort names
        const response = await fetch('/resort-names');
        
        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Parse the JSON response
        const resorts = await response.json();
        
        // Create the select button and append options
        const selectElement = document.getElementById('Resort');
        resorts.forEach(resort => {
            const option = document.createElement('option');
            option.value = resort; // Set the option value
            option.textContent = resort; // Set the display text
            selectElement.appendChild(option);
        });
        
        // Initialize Select2 on the Resort select element after options are loaded
        $('#Resort').select2({
            placeholder: "Search for a resort",
            allowClear: true
        });

    } catch (error) {
        console.error('Error fetching resort names:', error);
    }
});
