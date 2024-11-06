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
    if (req.query.search) {
        resorts = filterBySearch(resorts, req.query.search)
    }
    if (req.query.lat && req.query.lon && req.query.range) {
        resorts = filterByDistance(resorts, req.query, req.query.range);
    }

    res.send(generateSearchHtml(resorts))
});

function filterBySearch(resorts, search) {
    let new_resorts = new Array();
    for (let resort of resorts) {
        if (resort.state.toLowerCase().includes(search.toLowerCase()) ||
            resort.resort_name.toLowerCase().includes(search.toLowerCase()))
            new_resorts.push(resort);
    }
    return new_resorts;
}

function generateSearchHtml(resorts) {
    let html = "";
    let distance = "";
    for (let resort of resorts) {
        if ()
        html = html.concat(
`<div class="resort-card">
    <h3>${resort.resort_name}</h3>
    <img src=flags/Flag_of_${resort.state.replaceAll(' ', '_')}.svg alt="State Logo" class="resort-logo" height=200 width=200>
    <div class="resort-details">
        <div id="piechart"></div>
        <p>Green Acres: ${resort.green_acres}<p>
        <p>Blue Acres: ${resort.blue_acres}<p>
        <p>Black Acres: ${resort.black_acres}<p>
        <p>Total Acres: ${resort.acres}<p>
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

function filterByDistance(trips, location, range) {
    let new_resorts = Array();
    for (let resort of resorts) {
        if (geo.calculateDistance(resort, location, { unit: 'mi' }) < range) {
            new_resorts.push(resort);
        }
    }
    return new_resorts;
}
