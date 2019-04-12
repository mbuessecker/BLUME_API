const express = require('express');
const bodyParser = require('body-parser');

const scraper = require('./scraper');

const port = 5000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const asyncMiddleware = fn =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    };

app.get('/api/v1/latestMeasurement_PM10', asyncMiddleware(async (req, res) => {
    res.json('send Data');
}));

app.listen(port, asyncMiddleware(async (req, res) => {
    console.log(`Listening on port ${port}`);
    await scraper.scrape().then(async data => {
        // Here we can access the scraped data from BLUME.
        // console.log(data);
        /* For every measuring point (Messstaion) there is a timestamp, the coordinated, and measurements. For the API we need to combine all the measurements for one measurement type (e.g. PM10) and format it so it looks like this: 
        [
            {
                timestamp: ...,
                latitude: ...,
                longitude: ...,
                measurement: ...(number)
            },
            {
                timestamp: ...,
                latitude: ...,
                longitude: ...,
                measurement: ...(number)
            },
            .
            .
            .
        ]
        I already added one endpoint above. Just add more endpoints for the other measurement types and send the corresponding data :)
        */
    });
}));
