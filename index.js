var express = require('express');
var proxy = require('express-http-proxy');

var app = express();

app.use('/maps', proxy('https://maps.googleapis.com', {
    https: true,
    proxyReqPathResolver: function(req) {
        return `/maps${req.url}`;
    }
}));
app.use('/forecast', proxy('https://api.darksky.net', {
    https: true,
    proxyReqPathResolver: function(req) {
        return `/forecast${req.url}`;
    }
}));

app.listen(process.env.PORT || 3001, () => console.log(`App running on ${process.env.PORT || 3001}!`));
