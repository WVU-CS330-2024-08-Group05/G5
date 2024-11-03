
$.getJSON("resortdata.json", function(json){
    resortData = JSON.parse(json);
    console.log(resortData[0]);
});

console.log(resortData[0]);

$(function () {
    $('p').html("hello");
});

function filterByDistance(trips, location) {
    return;
}

function filterByState(trips, state) {
    return;
}