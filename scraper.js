const rp = require('request-promise');
const $ = require('cheerio');

const baseUrl = 'https://luftdaten.berlin.de';

// First we have to get the URLs of the measuering points of BLUME.
rp(baseUrl + '/lqi')
    .then((html) => {
        const numberOfMeasuringPoints = $('a.lmn-button', html).length;
        const urlsMeasuringPoints = [];

        for (let i = 0; i < numberOfMeasuringPoints; i++) {
            urlsMeasuringPoints.push($('a.lmn-button', html)[i].attribs.href);
        }

        // Now we can get the measurements from the measuring points.
        urlsMeasuringPoints.forEach(measuringPointUrl => {
            getLatestMeasurements(baseUrl + measuringPointUrl)
        });
        //getLatestMeasurements(baseUrl + urlsMeasuringPoints[0]);
    })
    .catch(function (err) {
        //handle error
    });

function getLatestMeasurements(measuringPointUrl) {
    rp(measuringPointUrl)
        .then((html) => {
            // We need latitude, longitude, (height), timestamp, measurements and measurementTypes.
            const measurementTypesTableRow = $('thead', html).children().first().children();
            const numberOfMeasurementsTypes = $(measurementTypesTableRow).length;
            const latestMeasurementTableRow = $('tbody', html).children().first();
            const dateTableCell = $(latestMeasurementTableRow).children().first();
            
            let measurementTypes = [];
            for (let i = 1; i < numberOfMeasurementsTypes; i++) {
                const currentTableCell = $(measurementTypesTableRow[i]);
                measurementTypes.push($(currentTableCell).children().first().text());
            }

            let measurements = [];
            $(dateTableCell).nextAll().each((i, element) => {
                const measurementWithoutUnit = $(element).contents().not($(element).children()).text().trim();
                measurements.push(measurementWithoutUnit);
            });

            let timestamp = $(dateTableCell).children().first().text();
            timestamp = new Date(timestamp).toLocaleString();

            const latestMeasurements = {
                'timestamp': timestamp,
            }

            measurementTypes.forEach((measurementType, i) => {
                if(measurementType !== '') {
                    latestMeasurements[measurementType] = measurements[i];
                }
            });

            console.log(latestMeasurements);

            return latestMeasurements;
        });
}