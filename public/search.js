const baseUrl = 'http://localhost:8080';

// Search functionality
console.log('search funcitonality...');
$(function () {
    console.log('ready...');

    $('#search-button').on('click', async function () {
        // Get search bar value
        let search = $('#search-bar').val();
        // Create url for /search.html
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
    });

    // Cancel button
    $('#search-cancel').on('click', function () {
            $('#main').show();
            $('#search-results').hide();
        });

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
        var options = { 'width': 120, 'height': 120,
            'colors': ['#6ad977', '#6070d6', '#161617'],
            legend: 'none',
            'chartArea': { 'width': '100%', 'height': '100%' }
        };

        // Display the chart inside the <div> element with id="piechart"
        var chart = new google.visualization.PieChart(element);
        chart.draw(data, options);
    }
}
