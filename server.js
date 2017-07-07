var express = require('express'),
    app = express(),
    port = process.env.PORT || 3001,
    bodyParser = require('body-parser'),
    bearerToken = require('express-bearer-token'),
    gpio = require('rpi-gpio'),
    text = 'This is a text',
    to = ['18016130856','16177497073'];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});
app.use(bearerToken());


var routes = require('./api/routes/panicApiRoutes');
routes(app);

app.listen(port);

console.log('panic RESTful API server started on: ' + port);

gpio.on('change', function() {
    console.log('SMS "' +text+ '" sent to', to.join(', '));
});
gpio.setup(36, gpio.DIR_IN, gpio.EDGE_FALLING);