const rp = require('request-promise');
const $ = require('cheerio');
const axios = require('axios');
const querystring = require('querystring');
const config = require('./config.json');

const API_KEY_GOOGLE = config['API_KEY_GOOGLE'];

const baseUrl = 'https://luftdaten.berlin.de';

function scrape() {
    // First we have to get the URLs of the measuering points of BLUME.
    rp(baseUrl + '/lqi')
        .then(async (html) => {
            const numberOfMeasuringPoints = $('a.lmn-button', html).length;
            const urlsMeasuringPoints = [];

            for (let i = 0; i < numberOfMeasuringPoints; i++) {
                urlsMeasuringPoints.push($('a.lmn-button', html)[i].attribs.href);
            }

            // Now we can get the measurements from the measuring points.
            urlsMeasuringPoints.forEach(async measuringPointUrl => {
                //await getLatestMeasurements(baseUrl + measuringPointUrl)
            });
            await getLatestMeasurements(baseUrl + urlsMeasuringPoints[0]);
        })
        .catch(function (err) {
            //handle error
        });
}

async function getLatestMeasurements(measuringPointUrl) {
    rp(measuringPointUrl)
        .then(async (html) => {
            // We need latitude, longitude, (height), timestamp, measurements and measurementTypes.
            const measurementTypesTableRow = $('thead', html).children().first().children();
            const numberOfMeasurementsTypes = $(measurementTypesTableRow).length;
            const latestMeasurementTableRow = $('tbody', html).children().first();
            const dateTableCell = $(latestMeasurementTableRow).children().first();

            const measurementTypes = [];
            for (let i = 1; i < numberOfMeasurementsTypes; i++) {
                const currentTableCell = $(measurementTypesTableRow[i]);
                measurementTypes.push($(currentTableCell).children().first().text());
            }

            const measurements = [];
            $(dateTableCell).nextAll().each((i, element) => {
                const measurementWithoutUnit = $(element).contents().not($(element).children()).text().trim();
                measurements.push(measurementWithoutUnit);
            });

            let timestamp = $(dateTableCell).children().first().text();
            timestamp = new Date(timestamp).toLocaleString();

            const address = $('dt:contains("Adresse:")', html).next().text();
            const coordinates = await getCoordinatesFromAddress(address);

            const latestMeasurements = {
                'timestamp': timestamp,
                'latitude': coordinates.lat,
                'longitude': coordinates.lng
            }
            measurementTypes.forEach((measurementType, i) => {
                if (measurementType !== '') {
                    latestMeasurements[measurementType] = measurements[i];
                }
            });

            return latestMeasurements;
        });
}

async function getCoordinatesFromAddress(address) {
    const params = querystring.stringify({
        address,
        key: API_KEY_GOOGLE,
    });

    const result = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?${params}`);
    return result.data.results[0].geometry.location;
}

module.exports = {
    scrape
}