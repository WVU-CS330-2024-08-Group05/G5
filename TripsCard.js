/** Handles HTML card generation for the previous trips on account page */

const sql = require('./sql.js');


async function html(username) {

    const trips = sql.getTrips(username);

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