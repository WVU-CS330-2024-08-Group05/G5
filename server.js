/**
 * Server on http://localhost:8080
 */

const express = require('express');
const path = require('path');
const app = express();
import * as s from 'search.js';

// server files from public dir
app.use(express.static(__dirname));

app.listen(8080, function () {
    console.log('Listening on port 8080...');
});

app.get('/search.html', function (req, res) {
    s.getResorts().then(function (resorts) {
        if (res.query.state) {
            res.send(s.generateSearchHtml(s.filterByState(resorts, res.query.state)));
        } else {
            res.send(s.generateSearchHtml(resorts))
        }
})});
