/*
https://api.weather.gov/points/{latitude},{longitude}

forecastHourly - forecast for hourly periods over the next seven days
"forecastHourly": "https://api.weather.gov/gridpoints/TOP/32,81/forecast/hourly"

forecast - forecast for 12h periods over the next seven days
"forecast": "https://api.weather.gov/gridpoints/TOP/32,81/forecast"

period format:
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


async function get_resort_weather(resort) {
    data = await fetch(`https://api.weather.gov/points/${resort.lat},${resort.lon}`).json();
    twevle_hour = await fetch(`${data.properties.forcast}`).json();

    return twelve_hour.periods;
}

async function get_resort_weather_hourly(resort) {
    data = await fetch(`https://api.weather.gov/points/${resort.lat},${resort.lon}`).json();
    hourly = await fetch(`${data.properties.forcastHourly}`).json();

    return hourly.periods;
}
