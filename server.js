/**
 * Server on http://localhost:8080
 */

const express = require('express');
const path = require('path');
const app = express();

// serve files from root dir
app.use(express.static(__dirname));

app.listen(8080, function () {
    console.log('Listening on port 8080...');
});

// Search functionality
app.get('/search.html', function (req, res) {
    getResorts().then(function (resorts) {
        if (res.query && res.query.state) {
            res.send(generateSearchHtml(filterByState(resorts, res.query.state)));
        } else {
            res.send(generateSearchHtml(resorts))
        }
})});

async function getResorts() {
    const res = await fetch('./resortdata.json');
    return await res.json();
}

function getStates(resortData) {
    let states = new Array();
    for (let resort of resortData) {
        states.push(resort.state);
    }
    return states;
}

function filterByState(trips, state) {
    let resorts = new Array();
    for (let resort of resortData) {
        if (resort.state.tolower() == state.tolower())
            resorts.push(resort);
    }
    return resorts;
}

function generateSearchHtml(resorts) {
    let html = new String();
    for (let resort of resorts) {
        html.append(
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
