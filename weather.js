/*
National Weather Service API

https://api.weather.gov/points/{latitude},{longitude}

forecastHourly - forecast for hourly periods over the next seven days
"forecastHourly": "https://api.weather.gov/gridpoints/TOP/32,81/forecast/hourly"

forecast - forecast for 12h periods over the next seven days
"forecast": "https://api.weather.gov/gridpoints/TOP/32,81/forecast"

example period format:
{
    "number": 1,
    "name": "This Afternoon",
    "startTime": "2024-11-19T17:00:00-06:00",
    "endTime": "2024-11-19T18:00:00-06:00",
    "isDaytime": true,
    "temperature": 53,
    "temperatureUnit": "F",
    "temperatureTrend": "",
    "probabilityOfPrecipitation": {
        "unitCode": "wmoUnit:percent",
        "value": null
    },
    "windSpeed": "10 mph",
    "windDirection": "W",
    "icon": "https://api.weather.gov/icons/land/day/rain_showers?size=medium",
    "shortForecast": "Chance Rain Showers",
    "detailedForecast": "A chance of rain showers. Mostly cloudy, with a high near 53. West wind around 10 mph."
}
*/

const xml2js = require('xml2js');
const parser = new xml2js.Parser();

async function getResortWeather(resort) {
    let url = `https://api.weather.gov/points/${resort.lat},${resort.lon}`;
    data = await fetch(url);
    if (!data.ok) {
        console.log(data);
        throw new Error(`Failed to fetch ${url}...`);
    }
    data = await data.json();
    url = `${data.properties.forecast}`;
    let twelve_hour = await fetch(url);
    if (!twelve_hour.ok) {
        console.log(data);
        throw new Error(`Failed to fetch ${url}...`);
    }
    twelve_hour = await twelve_hour.json();

    return twelve_hour.properties.periods;
}

async function getResortWeatherHourly(resort) {
    data = await fetch(`https://api.weather.gov/points/${resort.lat},${resort.lon}`)
    if (!data.ok) {
        throw new Error('Failed to fetch...');
    }
    data = await data.json();
    hourly = await fetch(`${data.properties.forecastHourly}`);
    if (!hourly.ok) {
        throw new Error('Failed to fetch...');
    }
    hourly = await hourly.json;

    return hourly.properties.periods;
}

/**
 * National Digital Forecast Database (NDFD) API
 * 
 * https://graphical.weather.gov/xml/SOAP_server/ndfdXMLclient.php
 * (fine-resolution (1-hour, 2.5km))
 * 
 * Relevant items:
 * 
 * <winter-weather-outlook type="snowfall probability" units="percent" time-layout="k-p12h-n5-19">
 * <name>Snow Probability, 90% Exceedance Percentile for 72-Hour Time Window</name>
 */

/**
 * Single point unsummarized data
 * @param {lat, lon} point Point to 
 */
async function getNdfdData(point) {
    const date = new Date();

    const params = {
        lat: point.lat,
        lon: point.lon,
        product: 'time-series',
        begin: date.toISOString().replace(/\:\d\d\..*$/, ''),
        end: '',
        Unit: 'e',
    }

    let url = new URL('https://digital.weather.gov/xml/SOAP_server/ndfdXMLclient.php');

    for (let param in params) {
        url.searchParams.append(param, params[param]);
    }

    console.log(url);
    return;

    let data = await fetch(url);
    data = await data.text();
    data = await parser.parseStringPromise(data);
    data = data.dwml.data[0].parameters[0];

    return data;
}

module.exports = {
    getResortWeather,
    getResortWeatherHourly,
    getNdfdData,
};
