const baseUrl = 'http://localhost:8080';

// Search functionality
console.log('search functionality...');
$(function () {
    console.log('ready...');

    // Common function to handle the search
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        async function performSearch() {
            // Get search bar value
            let search = $('#search-bar').val();
            // Create URL for /search.html
            let url = new URL('./search.html', baseUrl);
            if (search) url.searchParams.append('search', search);
            
            // Handle location and range parameters
            if ("geolocation" in navigator) {
                console.log('Getting location...');
                try {
                    const pos = await new Promise((resolve, reject) =>
                        navigator.geolocation.getCurrentPosition(resolve, reject)
                    );
                    if (pos.coords) {
                        url.searchParams.append('lat', pos.coords.latitude.toString());
                        url.searchParams.append('lon', pos.coords.longitude.toString());
                        url.searchParams.append('range', $('#range').val().toString());
                    }
                } catch (error) {
                    console.error('Error getting location:', error);
                }
            }
            // Hide main, show search-results
            $('#main').hide();
            // Fetch search results
            console.log(`Fetching ${url.toString()}...`);
            fetch(url).then((res) => res.text())
                .then((html) => {
                    if (html) $('#search-results').html(html);
                    else $('#search-results').html('<h2>No results...</h2>');
                    $('#search-results').show();
                })
                .then(drawCharts);
        }
        performSearch();
        // Listen for button click
        $('#search-button').on('click', performSearch);

        // Listen for Enter key press in the search bar
        $('#search-bar').on('keypress', function (e) {
            if (e.which === 13) { // 13 is the Enter key code
                e.preventDefault(); // Prevent form submission if inside a form
                performSearch();    // Call the search function
            }
        });
        
        // Clear search
        let previousValue = '';
        $('#search-bar').on('input', function () {
            // Performs search as you give input
            
            /*if (previousValue !== '') {
                performSearch();
            }*/
            const currentValue = $(this).val();
            if (currentValue === '' && previousValue !== '') {
                console.log('Clearing results');
                // Clear search results when clear button is clicked
                $('#main').show();
                $('#search-results').hide();
                $('#search-results').html('');
            }
            previousValue = currentValue; // Update the previous value
        });
    }
});

// Pie chart
// Load google charts
google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawCharts);

// Draw the chart and set the chart values
function drawCharts() {
    for (let element of document.getElementsByClassName('piechart')) {
        var data = google.visualization.arrayToDataTable(eval(element.textContent));

        // Optional; add a title and set the width and height of the chart
        var options = { 'width': 100, 'height': 100,
            'colors': ['#6ad977', '#6070d6', '#161617'],
            legend: 'none',
            'chartArea': { 'width': '100%', 'height': '100%' }
        };

        // Display the chart inside the <div> element with id="piechart"
        var chart = new google.visualization.PieChart(element);
        chart.draw(data, options);
    }
}
