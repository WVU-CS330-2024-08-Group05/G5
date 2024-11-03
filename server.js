/**
 * Server on http://localhost:8080
 */

const express = require('express');
const path = require('path');
const app = express();

// server files from public dir
app.use(express.static(__dirname));

app.listen(8080, function () {
    console.log('Listening on port 8080...');
});

