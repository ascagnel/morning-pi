const fs = require('fs');
const path = require('path');
const express = require('express');
const proxy = require('express-http-proxy');
const dotenv = require('dotenv');
const fetch = require('isomorphic-fetch');
const { parseString } = require('xml2js');

const LOG_LEVELS = {
    DEBUG: 'log',
    INFO: 'info',
    ERROR: 'error',
};

const log = (level, string, error) => {
    const levels = Object.values(LOG_LEVELS);
    const logLevel = levels.indexOf(process.env.LOG_LEVEL || LOG_LEVELS.INFO);
    const targetLevel = levels.indexOf(level);

    const time = new Date();
    string = `${time}: ${string}`;

    if (targetLevel >= logLevel) {
        error ? console.error(string, error) : console.log(string);
    }
};

const app = express();
dotenv.config();

app.use('/maps', proxy('https://maps.googleapis.com', {
    https: true,
    proxyReqPathResolver: req => `/maps${req.url.replace('$KEY', process.env.MAPS_API_KEY)}`
}));

app.use('/forecast', proxy('https://api.darksky.net', {
    https: true,
    proxyReqPathResolver: req => `/forecast${req.url.replace('$KEY', process.env.DARK_SKY_API_KEY)}`
}));

app.use('/bus', async (req, res) => {
    const stop = parseInt(req.query.stop);
    log(LOG_LEVELS.INFO, `Fetching data for bus stop '${stop}'`);
    const path = `http://mybusnow.njtransit.com/bustime/eta/getStopPredictionsETA.jsp?route=all&stop=${req.query.stop}&key=${Math.random()}`;

    const response = await fetch(path);
    if (!response.ok) {
        res.send(response.status);
        return;
    }
    try {
        const result = await response.text();
        parseString(result, (err, jsonString) => {
            if (err) {
                log(LOG_LEVELS.ERROR, 'Could not parse result XML', err);
                res.send(500);
                return;
            }
            log(LOG_LEVELS.DEBUG, `NJT result: ${jsonString}`);
            res.json(jsonString);
        });
    } catch (e) {
        log(LOG_LEVELS.ERROR, 'Could not parse response', e);
        res.sendStatus(500);
    }
});

app.use('/data', (req, res) => {
    fs.readFile(path.join(__dirname, './config.json'), { encoding: 'utf8' }, (err, data) => {
        if (err) {
            throw err;
        }

        const config = JSON.parse(data);
        res.json(config);
    });
});

app.use(express.static('build'));

app.listen(process.env.PORT || 3001, () => log(LOG_LEVELS.INFO, `App running on ${process.env.PORT || 3001}!`));
