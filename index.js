const fs = require('fs');
const path = require('path');
const express = require('express');
const proxy = require('express-http-proxy');
const dotenv = require('dotenv');

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
