const fs = require('fs');
const path = require('path');
const express = require('express');
const proxy = require('express-http-proxy');
const dotenv = require('dotenv');
const fetch = require('isomorphic-fetch');
const { parseString } = require('xml2js');

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
                console.error('Could not parse result XML', err);
                res.send(500);
                return;
            }
            res.json(jsonString);
        });
    } catch (e) {
        console.error('Could not parse response', e);
        res.send(500);
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

app.listen(process.env.PORT || 3001, () => console.log(`App running on ${process.env.PORT || 3001}!`));
