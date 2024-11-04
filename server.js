/**
 * Server on http://localhost:8080
 */

const express = require('express');
const path = require('path');
const app = express();
const RESORTS = require('./resortdata.json');
const STATES = getStates(RESORTS);

// serve files from root dir
app.use(express.static(__dirname));

app.listen(8080, function () {
    console.log('Listening on port 8080...');
});

// Search functionality
app.get('/search.html', function (req, res) {
        if (req.query && req.query.state) {
            res.send(generateSearchHtml(filterByState(RESORTS, req.query.state)));
        } else {
            res.send(generateSearchHtml(RESORTS))
        }
});

function getStates(resorts) {
    let states = new Array();
    for (let resort of resorts) {
        states.push(resort.state);
    }
    return states;
}

function filterByState(resorts, state) {
    let new_resorts = new Array();
    for (let resort of resorts) {
        if (resort.state.toLowerCase() == state.toLowerCase())
            new_resorts.push(resort);
    }
    return new_resorts;
}

function generateSearchHtml(resorts) {
    let html = "";
    for (let resort of resorts) {
        html = html.concat(
            `<div class="resort-card">
            < div class="resort-logo" >
                <img src="logo-placeholder.png" alt="Resort Logo">
            </div>
            <div class="resort-details">
                <h2><a href="#PLACEHOLDER">${resort.name}</a></h2>
                <p>Brief Description / Distance</p>
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
