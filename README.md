# BLUME API

This project aims to provide a RESTful API for getting the air data from the official measuring points from the [Berliner Luftgütemessnetz](https://luftdaten.berlin.de/lqi) (BLUME).
The data is only available on their website or as CSV-files. So in order to fetch the data, we are going to scrape the website and then make the data available through endpoints that will be documented here.

## Installation

The project is not done yet, but feel free to use it. 

If you would like to run it on your own computer you need to have [Node.js and NPM](https://nodejs.org/en/) installed.
Clone the project and install the necessary npm packages with `npm install`. 

In the *root folder* you need to add a file called *config.json* which contains your Google API key. The key is necessary to parse the addresses of the measuring points to coordinates. The *config.json* should look like this:
```
{
    “API_KEY_GOOGLE”: “XXXXXXXXXXXXXXXXXXXX”
}
```

Run the server with `npm start`.