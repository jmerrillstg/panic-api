var express = require('express'),
    app = express(),
    port = process.env.PORT || 3001,
    bodyParser = require('body-parser'),
    bearerToken = require('express-bearer-token'),
    nodemailer = require('nodemailer'),
    appConfig = require('./appConfig.js'),
    transporter = nodemailer.createTransport(appConfig.mailConfig);

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
var lastPressed=0;
console.log('panic RESTful API server started on: ' + port);
if (appConfig.environment==='production') {
    var gpio = require('rpi-gpio');
    gpio.on('change', function() {
        var mailOptions = {
            from: mailconfig.auth.user,
            to: mailconfig.auth.user, // change this to the real recipient. For now it just sends to the user sending the message
            subject: 'this email was sent by pushing a button!',
            text: 'did this work?'
        };
        transporter.sendMail(mailOptions, function(){});
        var d = new Date();
        if(lastPressed+5<Math.round(d.getTime() / 1000)) {
            console.log('pressed');
            lastPressed=Math.round(d.getTime() / 1000);
        }
    });
    gpio.setup(5, gpio.DIR_IN, gpio.EDGE_FALLING);
}
