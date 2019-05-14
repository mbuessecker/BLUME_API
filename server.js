const express = require('express');
const bodyParser = require('body-parser');

const scraper = require('./scraper');

const mcache = require("memory-cache");

const port = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const asyncMiddleware = fn => (req, res, next) => {
    Promise
        .resolve(fn(req, res, next))
        .catch(next);
};

let memCache = new mcache.Cache();
// cacheUpdate refreshes the cashe.
async function cacheUpdate(mesurementTypes) {
    await scraper.scrape(mesurementTypes)
        .then(async dataArray => {
            let keyCache = '/api/v1/latestMeasurement_' + JSON.stringify(mesurementTypes).slice(1,-1);
            memCache.put(keyCache, dataArray, 15*60000);
            console.log(keyCache);
            await Promise.resolve();
        }, async err => {
            console.log(err);
            response.sendStatus(500);
            await Promise.reject(err);
        });
}
// casheSetTimeout the cashe every 15 minutes.
setTimeout(() => {
    let mesurementTypes = ['CHT', 'CHB', 'SO2', 'CO', 'O3', 'NOX', 'NO2', 'NO', 'PM10' ];
    mesurementTypes.forEach((type) => {
        cacheUpdate(type);
    });
    console.log(memCache.get('/api/v1/latestMeasurement_PM10'))
}, 15*60000);


async function handleScrapeMeasurements(types, response) {
    await scraper.scrape(types)
        .then(async dataArray => {
            response.json(dataArray)
            await Promise.resolve();
        }, async err => {
            console.log(err);
            response.sendStatus(500);
            await Promise.reject(err);
        });
}

// cacheMiddleware checks the cache and returns the value. Without matching key it just starts the scraper
let cacheMiddleware = (duration) => {
    return (req, res, next) => {
        let key = req.originalUrl || req.url
        let cacheContent = memCache.get(key);
        if(cacheContent){
            res.send( cacheContent );
            console.log("MemeCashe route");
            console.log(key);
            return
        }else{
            res.sendResponse = res.send
            res.send = (body) => {
                memCache.put(key,body,duration*60000);
                res.sendResponse(body)
                console.log("standard route");
            }
            next()
        }
    }
}

app.get('/api/v1/latestMeasurement_PM10', cacheMiddleware(15), asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(['PM10'], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_NO', cacheMiddleware(15), asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(['NO'], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_NO2',cacheMiddleware(15), asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(['NO₂'], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_NOX',cacheMiddleware(15), asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(['NOx'], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_O3',cacheMiddleware(15), asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(['O₃'], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_CO',cacheMiddleware(15), asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(['CO'], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_SO2',cacheMiddleware(15), asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(['SO₂'], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_CHB',cacheMiddleware(15), asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(['CHB'], res).catch(() => {});
}));

app.get('/api/v1/latestMeasurement_CHT',cacheMiddleware(15), asyncMiddleware(async (req, res, next) => {    
    handleScrapeMeasurements(['CHT'], res).catch(() => {}); 
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
