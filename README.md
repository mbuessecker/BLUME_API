# BLUME API

This project provides a RESTful API for getting the air data from the official measuring points from the [Berliner Luftgütemessnetz](https://luftdaten.berlin.de/lqi) (BLUME).
The data is only available on their website or as CSV-files. So in order to fetch the data, the website is scraped and the data is made available through endpoints (see [documentation](#api-documentation)).

## Installation

Feel free to use the project for yourself. 

If you would like to run it on your own computer you need to have [Node.js and NPM](https://nodejs.org/en/) installed.
Clone the project and install the necessary npm packages with `npm install`. 

In the *root folder* you need to add a file called *config.json* which contains your Google API key. The key is necessary to parse the addresses of the measuring points to coordinates. The *config.json* should look like this:
```
{
    “API_KEY_GOOGLE”: “XXXXXXXXXXXXXXXXXXXX”
}
```

Run the server with `npm start`.

## API documentation

The API provides the latest measurement values for one measurement type (e.g. PM10) from all measuring stations. 
The response will look something like this:
```
[
    {
    "timestamp": "2019-5-2 10:00:00",
    "latitude": "52.513999",
    "longitude": "13.4700456",
    "value": "0,8"
    },
    .
    .
    .
]
```
The following endpoints are available:

* GET /api/v1/latestMeasurement_PM10
* GET /api/v1/latestMeasurement_NO
* GET /api/v1/latestMeasurement_NO2
* GET /api/v1/latestMeasurement_NOX
* GET /api/v1/latestMeasurement_O3
* GET /api/v1/latestMeasurement_CO
* GET /api/v1/latestMeasurement_SO2
* GET /api/v1/latestMeasurement_CHB
* GET /api/v1/latestMeasurement_CHT
