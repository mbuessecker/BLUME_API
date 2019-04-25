const express = require('express');
const bodyParser = require('body-parser');

const scraper = require('./scraper');

const port = 5000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const asyncMiddleware = fn => (req, res, next) => {
    Promise
        .resolve(fn(req, res, next))
        .catch(next);
};

async function handleScrapeMeasurements(types, response) {
    await scraper.scrape(types)
        .then(async dataArray => {
            // Here we can access the scraped data from BLUME.
            response.json(dataArray)
            await Promise.resolve();
        }, async err => {
            console.log(err);
            response.sendStatus(500);
            await Promise.reject(err);
        });
}

app.get('/api/v1/latestMeasurement_PM10', asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(["PM10"], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_NO', asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(["NO"], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_NO2', asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(["NO₂"], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_NOX', asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(["NOx"], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_O3', asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(["O₃"], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_CO', asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(["CO"], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_SO2', asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(["SO₂"], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_CHB', asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(["CHB"], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_CHT', asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(["CHT"], res).catch(() => {}); 
}));

app.get('/api/v1/latestMeasurement', asyncMiddleware(async (req, res, next) => {
    // Generic method taking url query parameters
    var requestedTypes = [];
    if (req.query.type !== undefined) {
        requestedTypes = req.query.type.split(',');
    }
    
    handleScrapeMeasurements(requestedTypes, res).catch(() => {});
}));

app.listen(port, asyncMiddleware(async (req, res) => {
    console.log(`Listening on port ${port}`);
    handleScrapeMeasurements([], res).catch(() => {});
}));
