var express = require('express'),
    app = express(),
    port = process.env.PORT || 3001,
    bodyParser = require('body-parser'),
    bearerToken = require('express-bearer-token'),
    gpio = require('rpi-gpio'),
    voice = require('voice.js');
var mailConfig = require('../../mailConfig.js');
var text = process.argv[4] || 'This is a test sms from jason\'s raspberry pi';
var to = process.argv.slice(5).length ?  process.argv.slice(5) : ['18016130856', '16177497073'];

var client = new voicejs.Client({
    email: process.argv[2] || mailConfig.auth.user,
    password: process.argv[3] || mailConfig.auth.pass,
    tokens: require('../../tokens.json')
});

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
    client.altsms({ to: to, text: text}, function(err, res, data){
        if(err){
            return console.log(err);
        }
        console.log('SMS "' +text+ '" sent to', to.join(', '));
    });
});
gpio.setup(36, gpio.DIR_IN, gpio.EDGE_FALLING);