/**
 * Provides methods for generating resort card html server-side.
 */
const Weather = require('../weather.js');

/**
 * Generates HTML for a resort card, including weather data, acreage breakdown,
 * and additional details like distance and rating.
 * 
 * @param {Object} resort - Object containing resort information.
 * @param {string} resort.resort_name - Name of the resort.
 * @param {string} resort.state - State where the resort is located.
 * @param {number} resort.lat - Latitude of the resort.
 * @param {number} resort.lon - Longitude of the resort.
 * @param {number} resort.distance - Distance to the resort (in miles).
 * @param {number} resort.green_acres - Number of green trail acres.
 * @param {number} resort.blue_acres - Number of blue trail acres.
 * @param {number} resort.black_acres - Number of black trail acres.
 * @param {number} resort.acres - Total acreage of the resort.
 * @param {Object} options - Additional options for rendering the card.
 * @param {boolean} options.distance - Whether to include distance in the card.
 * @returns {Promise<string>} A promise resolving to the HTML string for the resort card.
 */

async function html(resort, options) {
    // Set distance html
    let distance = "";
    if (options.distance) {
        distance = `<p>Distance: ${resort.distance} miles</p>`;
    }
    // Get array of weekdays, starting with Today
    let week_days = getWeekDays();
    // Get weather data (12-hour)
    let weather = await Weather.getResortWeather(resort);

    html =
        `<div class="resort-card">
    <h3>${resort.resort_name}</h3>
    <div class="resort-details">
        <img src=flags/Flag_of_${resort.state.replaceAll(' ', '_')}.svg alt="State Logo">
        <div class="piechart">[['Difficulty', 'Acres'], ['Green', ${resort.green_acres}], ['Blue', ${resort.blue_acres}], ['Black', ${resort.black_acres}]]</div >
        <div class="acreage-details">
        <table>
            <tr>
                <th>${week_days[0]}
                <th>${week_days[1]}
                <th>${week_days[2]}
                <th>${week_days[3]}
                <th>${week_days[4]}
                <th>${week_days[5]}
                <th>${week_days[6]}
            </tr>
            <tr>
                <td>${weather[0].temperature}\u00b0F
                <td>${weather[2].temperature}\u00b0F
                <td>${weather[4].temperature}\u00b0F
                <td>${weather[6].temperature}\u00b0F
                <td>${weather[8].temperature}\u00b0F
                <td>${weather[10].temperature}\u00b0F
                <td>${weather[12].temperature}\u00b0F
            </tr>
        </table>
        </div>
        <div class="other-resort-details">
        <p>Total Acres: ${resort.acres}<p>
        ${distance}
        </div>
        <div class="resort-rating">
            <p>Rating</p>
            </div>
                <button class="pin-button" data-resort-name="${resort.resort_name}">
                    <img src="pin-image.png" alt="Pin this resort" />
                </button>
            </div>
</div >
`
    return html
}

/**
 * Generates an array of weekdays starting from "Today."
 * 
 * @returns {string[]} Array of weekday names, starting with "Today."
 */
function getWeekDays() {
    let weekDays = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ];
    let date = new Date();
    let day = date.getDay();
    let week_array = [];
    for (i = 0; i < 7; ++i) {
        week_array.push(weekDays[(day + i) % 7]);
    }
    week_array[0] = "Today";
    return week_array;
}

module.exports = {
    html
}