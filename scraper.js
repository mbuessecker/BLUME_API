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
    })
    .catch(function (err) {
        //handle error
    });
