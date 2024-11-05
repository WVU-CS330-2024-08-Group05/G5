const baseUrl = 'http://localhost:8080';

// Search functionality
console.log('search funcitonality...');
$(function () {
    console.log('ready...');

    $('#search-button').on('click', function () {
        // Get search bar value
        let search = $('#search-bar').val();
        // Create url for /search.html
        let url = new URL('./search.html', baseUrl)
        if (search) url.searchParams.append('search', search);
        // Hide main, show search-results
        $('#main').hide();
        $('#search-results').show();
        // Fetch search results
        console.log(`Fetching ${url.toString()}...`);
        fetch(url).then((res) => res.text())
            .then((html) => {
                if (html) $('#search-results').html(html);
                else $('#search-results').html('<h2>No results...</h2>');
            });
    });

});