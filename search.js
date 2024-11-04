const baseUrl = 'http://localhost:8080';

// Search functionality
console.log('search funcitonality...');
$(function () {
    console.log('ready...');
    $('#search-button').on('click', function () {
        let state = $('#search-bar').val();
        var script = document.currentScript;
        console.log(`Searching for state ${state} in ${baseUrl}...`);
        let url = new URL('./search.html', baseUrl)
        if (state) url.searchParams.append('state', state);
        console.log(`Fetching ${url.toString()}...`);
        fetch(url).then((res) => $('#search-results').html(res));
    })

});