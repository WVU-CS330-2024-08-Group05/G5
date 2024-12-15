const RESORTS = require('../resortdata.json');
const NodeGeolocation = require('nodejs-geolocation').default;
const geo = new NodeGeolocation('App');
const ResortCard = require('./ResortCard.js');

const PAGES_SHOWN = 8;
const MAX_RESULTS = 10;
const MAX_FETCH_ATTEMPTS = 5;

async function html(options) {
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
                if (j == 5) {
                    throw err;
                }
                else {
                    console.error(`Nation weather service api timed out: try ${j}/5.`);
                }
            }
        }
    }

    // Create page footer html
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

    let page_footer = 
`
<nav aria-label="...">
  <ul class="pagination pagination-lg">
    ${allPageBtnHtml}
  </ul>
</nav>
`

    return results_html + page_footer;
}

function filterBySearch(resorts, options) {
    const search = options.search;
    return resorts.filter(function (resort) {
        return (resort.state.toLowerCase().includes(search.toLowerCase()) ||
            resort.resort_name.toLowerCase().includes(search.toLowerCase()));
    });
}

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