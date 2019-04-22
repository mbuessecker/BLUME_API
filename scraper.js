const rp = require('request-promise');
const $ = require('cheerio');
const axios = require('axios');
const querystring = require('querystring');
const config = require('./config.json');

const API_KEY_GOOGLE = config['API_KEY_GOOGLE'];

const baseUrl = 'https://luftdaten.berlin.de';

async function scrape(requestedMeasurementTypes) {
    // First we have to get the URLs of the measuering points of BLUME.
    return rp(baseUrl + '/lqi')
        .then(async html => {
            const data = [];
            const numberOfMeasuringPoints = $('a.lmn-button', html).length;
            const urlsMeasuringPoints = [];

            for (let i = 0; i < numberOfMeasuringPoints; i++) {
                urlsMeasuringPoints.push($('a.lmn-button', html)[i].attribs.href);
            }

            // Now we can get the measurements from the measuring points.            
            await Promise.all(urlsMeasuringPoints.map(async measuringPointUrl => {
                data.push(await getLatestMeasurements(baseUrl + measuringPointUrl, requestedMeasurementTypes));
            }));
            return data;
        })
        .catch((err) => {
            console.log(err);
        });
}

async function getLatestMeasurements(measuringPointUrl, requestedMeasurementTypes) {
    return rp(measuringPointUrl)
        .then(async html => {

            let needsAllMeasurements = requestedMeasurementTypes.length == 0;
            // We need latitude, longitude, (height), timestamp, measurements and measurementTypes.
            const measurementTypesTableRow = $('thead', html).children().first().children();
            const numberOfMeasurementsTypes = $(measurementTypesTableRow).length;
            const latestMeasurementTableRow = $('tbody', html).children().first();
            const dateTableCell = $(latestMeasurementTableRow).children().first();

            var measurementValues = {};

            let timestamp = $(dateTableCell).children().first().text();
            //timestamp = new Date(timestamp).toLocaleString();

            const address = $('dt:contains("Adresse:")', html).next().text();
            const coordinates = await getCoordinatesFromAddress(address);

            measurementValues["timestamp"] = timestamp;
            measurementValues["latitude"] = coordinates.lat;
            measurementValues["longitude"] = coordinates.lng;

            requestedMeasurementTypes.forEach((i, element) => {
                measurementValues[i] = null;
            });

            $(dateTableCell).nextAll().each((i, element) => {
                const measurement = $(element).contents().not($(element).children()).text().trim();
                const measurementUnit = $(measurementTypesTableRow[i]).children().first().text();
                let isRequestedMeasurementUnit = requestedMeasurementTypes.includes(measurementUnit);

                if ((needsAllMeasurements) || (isRequestedMeasurementUnit)) {
                    if (measurementUnit !== '') {
                        measurementValues[measurementUnit] = measurement;
                    }
                }
            });

            return measurementValues;
        })
        .catch((err) => {
            console.log(err);
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