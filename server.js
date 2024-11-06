/**
 * Server on http://localhost:8080
 */

const express = require('express');
const path = require('path');
const app = express();
const RESORTS = require('./resortdata.json');
const NodeGeolocation = require('nodejs-geolocation').default;
const geo = new NodeGeolocation('App');

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
    resorts = [...RESORTS];
    options = {distance: false};
    if (req.query.search) {
        resorts = filterBySearch(resorts, req.query.search)
    }
    if (req.query.lat && req.query.lon && req.query.range) {
        resorts = filterByDistance(resorts, req.query, req.query.range);
        options.distance = true;
    }

    res.send(generateSearchHtml(resorts, options))
});

function generateSearchHtml(resorts, options) {
    let html = "";
    let distance = "";
    if (options.distance) resorts.sort(function (a, b) {
        if (a.distance < b.distance) return -1;
        else if (a.distance > b.distance) return 1;
        else return 0;
    });
    for (let resort of resorts) {
        if (options.distance) {
            distance = `<p>Distance: ${resort.distance} miles</p>`;
        }
        html = html.concat(
            `<div class="resort-card">
    <h3>${resort.resort_name}</h3>
    <img src=flags/Flag_of_${resort.state.replaceAll(' ', '_')}.svg alt="State Logo" class="resort-logo" height="120" width="120">
    <div class="resort-details">
        <div id="piechart"></div>
        <p>Green Acres: ${resort.green_acres}<p>
        <p>Blue Acres: ${resort.blue_acres}<p>
        <p>Black Acres: ${resort.black_acres}<p>
        <p>Total Acres: ${resort.acres}<p>
        ${distance}
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

function filterBySearch(resorts, search) {
    let new_resorts = new Array();
    for (let resort of resorts) {
        if (resort.state.toLowerCase().includes(search.toLowerCase()) ||
            resort.resort_name.toLowerCase().includes(search.toLowerCase()))
            new_resorts.push(resort);
    }
    return new_resorts;
}

function filterByDistance(trips, location, range) {
    let new_resorts = Array();
    for (let resort of resorts) {
        let distance = geo.calculateDistance(resort, location, { unit: 'mi' });
        resort['distance'] = distance;
        if (distance < range) {
            new_resorts.push(resort);
        }
    }
    return new_resorts;
}
