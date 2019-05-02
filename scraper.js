const rp = require('request-promise');
const $ = require('cheerio');
const axios = require('axios');
const querystring = require('querystring');
const config = require('./config.json');
const moment = require('moment');

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

            await Promise
            .all(urlsMeasuringPoints
                .map(async measuringPointUrl => {
                        // Now we can get the measurements from the measuring points.            
                        let measurement = await getLatestMeasurements(baseUrl + measuringPointUrl, requestedMeasurementTypes);
                        if (measurement !== null) {
                            data.push(measurement);
                        }
                    }));
            return data;
        })
        .catch((err) => {
            return [];
        });
}

async function getLatestMeasurements(measuringPointUrl, requestedMeasurementTypes) {
    return rp(measuringPointUrl)
        .then(async html => {
            // We need latitude, longitude, (height), timestamp, measurements and measurementTypes.
            const measurementTypesTableRow = $('thead', html).children().first().children();
            const latestMeasurementTableRow = $('tbody', html).children().first();
            const dateTableCell = $(latestMeasurementTableRow).children().first();
    
            let timestamp = $(dateTableCell).children().first().text();
            let m = moment(timestamp, 'DD.MM.YYYY HH:mm', 'de');
            timestamp = new Date(m.toISOString()).toLocaleString();
            
            const address = $('dt:contains("Adresse:")', html).next().text();
            const coordinates = await getCoordinatesFromAddress(address);
            
            const measurements = {};
            $(dateTableCell).nextAll().each((i, element) => {
                const measurementValue = $(element).contents().not($(element).children()).text().trim();
                const measurementType = $(measurementTypesTableRow[i]).children().first().text();
                let isRequestedMeasurementType = requestedMeasurementTypes.includes(measurementType);
                
                if (isRequestedMeasurementType) {
                    if (measurementType !== '') {
                        measurements['timestamp'] = timestamp;
                        measurements['latitude'] = coordinates.lat;
                        measurements['longitude'] = coordinates.lng;
                        measurements['value'] = measurementValue;
                    }
                }
            });

            if (measurements['value'] == null) {
                return null;
            }

            return measurements;
        })
        .catch((err) => {
            console.log(err);
            return null;
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