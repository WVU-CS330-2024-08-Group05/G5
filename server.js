/**
 * Server on http://localhost:8080
 */

const express = require('express');
const path = require('path');
const app = express();
const RESORTS = require('./resortdata.json');

// serve files from root dir
app.use(express.static('public'));

app.listen(8080, function () {
    console.log('Listening on port 8080...');
});

/**
 * Search functionality
 * 
 * Search results include resorts with names that start with req.query.search and resorts that are in a state the the begins with req.query.search.
 */
app.get('/search.html', function (req, res) {
        if (req.query.search) {
            res.send(generateSearchHtml(filterBySearch(RESORTS, req.query.search)));
        } else {
            res.send(generateSearchHtml(RESORTS))
        }
});

function filterBySearch(resorts, search) {
    let new_resorts = new Array();
    for (let resort of resorts) {
        if (resort.state.toLowerCase().startsWith(search.toLowerCase()))
            new_resorts.push(resort);
        if (resort.resort_name.toLowerCase().startsWith(search.toLowerCase()))
            new_resorts.push(resort);
    }
    return new_resorts;
}

function generateSearchHtml(resorts) {
    let html = "";
    for (let resort of resorts) {
        html = html.concat(
`<div class="resort-card">
    <div class="resort-logo">
        <img src="logo-placeholder.png" alt="Resort Logo">
    </div>
    <div class="resort-details">
        <h2><a href="#PLACEHOLDER">${resort.resort_name}</a></h2>
        <p>State: ${resort.state}</p>
    </div>
    <div class="resort-rating">
        <p>Rating</p>
    </div>
</div >
`
        );
    }
    return html;
}

function filterByDistance(trips, location) {
    return;
}

state_abbreviation_to_name = {
    "AK": "Alaska",
    "AL": "Alabama",
    "AR": "Arkansas",
    "AZ": "Arizona",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "IA": "Iowa",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "MA": "Massachusetts",
    "MD": "Maryland",
    "ME": "Maine",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MO": "Missouri",
    "MS": "Mississippi",
    "MT": "Montana",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "NE": "Nebraska",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NV": "Nevada",
    "NY": "New York",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VA": "Virginia",
    "VT": "Vermont",
    "WA": "Washington",
    "WI": "Wisconsin",
    "WV": "West Virginia",
    "WY": "Wyoming",
    "DC": "District of Columbia"
}