const express = require('express');
const bodyParser = require('body-parser');

const scraper = require('./scraper');

const port = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const asyncMiddleware = fn =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    };

app.listen(port, asyncMiddleware(async (req, res) => {
    console.log(`Listening on port ${port}`);
    await scraper.scrape();
}));
