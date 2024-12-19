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

    function precipProb(index) {
        const prob = weather[index].probabilityOfPrecipitation.value;
        return (prob) ? prob+'%' : '';
    }

    function getIcon(index) {
        const pp = weather[index].probabilityOfPrecipitation.value;
        const temp = weather[index].temperature;

        if (pp && pp > 30) {
            if (temp => 32) return `<img class="weather-icon" src="/weather-icons/001-rainy.png"/>`;
            else if (temp < 32) return `<img class="weather-icon" src="/weather-icons/004-snowflake.png"/>`;
        }
        else return '';
    }

    html =
        `<div class="resort-card">
    <h3>${resort.resort_name}</h3>
    <div class="resort-details">
        <img src=flags/Flag_of_${resort.state.replaceAll(' ', '_')}.svg alt="State Logo">
        <div class="piechart">[['Difficulty', 'Acres'], ['Green', ${resort.green_acres}], ['Blue', ${resort.blue_acres}], ['Black', ${resort.black_acres}]]</div >
        <div class="acreage-details">
        <table>
        <tr>
            <td>
            <td>${getIcon(0)}
            <td>${getIcon(2)}
            <td>${getIcon(4)}
            <td>${getIcon(6)}
            <td>${getIcon(8)}
            <td>${getIcon(10)}
            <td>${getIcon(12)}
        </tr>
            <tr>
                <th>
                <th>${week_days[0]}
                <th>${week_days[1]}
                <th>${week_days[2]}
                <th>${week_days[3]}
                <th>${week_days[4]}
                <th>${week_days[5]}
                <th>${week_days[6]}
            </tr>
            <tr>
                <th> Temperature
                <td>${weather[0].temperature}\u00b0F
                <td>${weather[2].temperature}\u00b0F
                <td>${weather[4].temperature}\u00b0F
                <td>${weather[6].temperature}\u00b0F
                <td>${weather[8].temperature}\u00b0F
                <td>${weather[10].temperature}\u00b0F
                <td>${weather[12].temperature}\u00b0F
            </tr>
            <th> Precipitation
            <td>${precipProb(0)}
            <td>${precipProb(2)}
            <td>${precipProb(4)}
            <td>${precipProb(6)}
            <td>${precipProb(8)}
            <td>${precipProb(10)}
            <td>${precipProb(12)}
        </table>
        </div>
        <div class="other-resort-details">
        <strong>
        ${distance}
        <p>Total Acres: ${resort.acres}</p>
        </strong>
        </div>
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