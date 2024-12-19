/**
 * Generates paginated HTML for a list of ski resorts based on search and filter options.
 * Includes functionality to filter resorts by name, state, or distance from a specified location.
 */

const RESORTS = require('../resortdata.json');
const NodeGeolocation = require('nodejs-geolocation').default;
const geo = new NodeGeolocation('App');
const ResortCard = require('./ResortCard.js');

const PAGES_SHOWN = 8;
const MAX_RESULTS = 10;
const MAX_FETCH_ATTEMPTS = 5;

/**
 * Generates HTML for a paginated list of resorts based on search and filter options.
 * 
 * @param {Object} options - Options for filtering and generating results.
 * @param {string} [options.search] - Search string to filter resorts by name or state.
 * @param {number} [options.lat] - Latitude for filtering resorts by distance.
 * @param {number} [options.lon] - Longitude for filtering resorts by distance.
 * @param {number} [options.range] - Maximum distance (in miles) to filter resorts.
 * @param {boolean} [options.distance] - Whether to include distance in resort details.
 * @param {string} options.url - Base URL for pagination links.
 * @param {number} options.page - Current page number for pagination.
 * @returns {Promise<string>} A promise that resolves to the generated HTML.
 * @throws {Error} If fetching resort weather data fails after multiple attempts.
 */
async function html(options) {
    result_header =
        `<div class="container-fluid"><button type="button" id="search-close-btn" class="btn-close" aria-label="Close"></button></div>`;

    let resorts = [...RESORTS];

    // Filter resorts by text segment
    if (options.search) {
        resorts = filterBySearch(resorts, options);
    }
    // Filter resorts by distance from location
    if (options.lat && options.lon && options.range) {
        resorts = filterByDistance(resorts, options);
        options.distance = true;
    }
    let results_html = '';
    // Sort resorts by distance from location
    if (options.distance) {
        resorts.sort((a, b) => a.distance - b.distance);
    }

    // Create results HTML
    const base = (options.page - 1) * MAX_RESULTS;
    for (let i = 0; i < MAX_RESULTS && i + base < resorts.length; ++i) {
        const resort = resorts[i + base];
        for (let j = 1; j <= MAX_FETCH_ATTEMPTS; ++j) {
            try {
                const cardHtml = await ResortCard.html(resort, options);
                results_html += cardHtml;
                break;
            } catch (err) {
                if (j == 5) console.log(resort);
                console.error(`Nation weather service api timed out: try ${j}/5.`);
            }
        }
    }

    // Create page footer html

    // Helper function to generate pagination button HTML
    function pageBtnHtml(num) {
        if (options.page == num) {
            return `<li class="page-item active" aria-current="page">
      <span class="page-link">${num}</span>
    </li>`;
        } else {
            let url = new URL(options.url);
            url.searchParams.set('page', num);
            return `<li class="page-item"><a class="page-link" href="${url.href}">${num}</a></li>`;
        }
    }

    let allPageBtnHtml = '';
    let lowest_page = options.page - PAGES_SHOWN / 2;
    if (lowest_page < 1) lowest_page = 1;

    // Loop to create page links
    for (let i = 0; i <= PAGES_SHOWN && i < Math.ceil(resorts.length / MAX_RESULTS); ++i) {
        allPageBtnHtml += pageBtnHtml(lowest_page + i);
    }

    let result_footer =
        `
<nav aria-label="...">
  <ul class="pagination pagination-lg">
    ${allPageBtnHtml}
  </ul>
</nav>
`
    return result_header + results_html + result_footer;
}

/**
 * Filters resorts based on a search string that matches their name or state.
 * 
 * @param {Object[]} resorts - Array of resort objects to filter.
 * @param {Object} options - Options object containing the search string.
 * @param {string} options.search - Search string to filter resorts.
 * @returns {Object[]} Array of resorts that match the search string.
 */
function filterBySearch(resorts, options) {
    const search = options.search;
    return resorts.filter(function (resort) {
        return (resort.state.toLowerCase().includes(search.toLowerCase()) ||
            resort.resort_name.toLowerCase().includes(search.toLowerCase()));
    });
}

/**
 * Filters resorts based on their distance from a specified location.
 * 
 * @param {Object[]} resorts - Array of resort objects to filter.
 * @param {Object} options - Options object containing location and range.
 * @param {number} options.lat - Latitude of the user's location.
 * @param {number} options.lon - Longitude of the user's location.
 * @param {number} options.range - Maximum distance (in miles) to include resorts.
 * @returns {Object[]} Array of resorts within the specified distance range.
 */
function filterByDistance(resorts, options) {
    return resorts.filter(function (resort) {
        let distance = geo.calculateDistance(resort, options, { unit: 'mi' });
        resort['distance'] = distance;
        return (distance < options.range);
    });
}


module.exports = {
    html
}