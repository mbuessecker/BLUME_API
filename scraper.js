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
    })
    .catch(function (err) {
        //handle error
    });

function getLatestMeasurements(measuringPointUrl) {
    rp(measuringPointUrl)
        .then((html) => {
            // We need: latitude, longitude, (height), timestamp, measurements and measurementTypes 
            const measurementTypesTableRow = $('thead', html).children().first().children();
            const numberOfMeasurementsTypes = $(measurementTypesTableRow).length;
            const latestMeasurementTableRow = $('tbody', html).children().first();
            const dateTableCell = $(latestMeasurementTableRow).children().first();

            let timestamp = $(dateTableCell).children().first().text();
            timestamp = new Date(timestamp).toLocaleString();

            const measurementTypes = [];
            for (let i = 1; i < numberOfMeasurementsTypes; i++) {
                const currentTableCell = $(measurementTypesTableRow[i]);
                measurementTypes.push($(currentTableCell).children().first().text());
            }
            console.log(timestamp);
            console.log(measurementTypes);

            return {
                'timestamp': timestamp
            }
        });
}