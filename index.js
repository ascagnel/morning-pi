const fs = require('fs');
const path = require('path');
const express = require('express');
const proxy = require('express-http-proxy');
const dotenv = require('dotenv');

const app = express();
dotenv.config();

/* inject local config */
const config = require('./config.json');

let template;

try {
    template = fs.readFileSync(path.join(__dirname, './build/index_original.html'), { encoding: 'utf8' });
} catch (e) {
    template = fs.readFileSync(path.join(__dirname, './build/index.html'), { encoding: 'utf8' });
    fs.writeFileSync(path.join(__dirname, './build/index_original.html'), template, { encoding: 'utf8' });
}

template = template.replace('__SERVER_DATA__', JSON.stringify(config));
fs.writeFileSync(path.join(__dirname, './build/index.html'), template, { encoding: 'utf8' });

app.use('/maps', proxy('https://maps.googleapis.com', {
    https: true,
    proxyReqPathResolver: function(req) {
        const string = req.url.replace('$KEY', process.env.MAPS_API_KEY);
        console.log(`/maps${string}`);
        return `/maps${string}`;
    }
}));

app.use('/forecast', proxy('https://api.darksky.net', {
    https: true,
    proxyReqPathResolver: function(req) {
        const string = req.url.replace('$KEY', process.env.DARK_SKY_API_KEY);
        return `/forecast${req.url}`;
    }
}));

app.use(express.static('build'));

app.listen(process.env.PORT || 3001, () => console.log(`App running on ${process.env.PORT || 3001}!`));
