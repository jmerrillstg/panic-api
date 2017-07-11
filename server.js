var express = require('express'),
    app = express(),
    port = process.env.PORT || 3001,
    bodyParser = require('body-parser'),
    bearerToken = require('express-bearer-token'),
    nodemailer = require('nodemailer'),
    appConfig = require('./appConfig.js'),
    transporter = nodemailer.createTransport(appConfig.mailConfig),
    mysql = require('mysql'),
    connection = mysql.createConnection(appConfig.dbConnect);

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

if (appConfig.environment==='production') {
    console.log('listening for button-presses on GPIO pin '+appConfig.gpioPin);
    var lastPressed=0;
    var gpio = require('rpi-gpio');
    gpio.on('change', function() {
        var d = new Date();
        if(lastPressed+5<Math.round(d.getTime() / 1000)) {
            var messageQuery = 'SELECT (SELECT message_text FROM messages) AS message_text, (SELECT GROUP_CONCAT(recipient_email SEPARATOR \';\') FROM recipients) AS recipients;';

            connection.query(messageQuery, function (err, message) {
                if (err || !message || !message.length) {
                    console.log('Can\'t get message');
                } else {
                    var mailOptions = {
                        from: appConfig.mailConfig.auth.user,
                        to: message[0].recipients,
                        subject: 'Panic Button',
                        text: message[0].message_text,
                        priority: 'high'
                    };
                    transporter.sendMail(mailOptions, function(){});
                    var logMessageQuery = 'INSERT INTO log (log_time) VALUES (NOW())';
                    connection.query(logMessageQuery, function (err) {
                        if (err) {
                            console.log('logging error');
                        }
                    });
                }
            });

            lastPressed=Math.round(d.getTime() / 1000);
        }
    });
    gpio.setup(appConfig.gpioPin, gpio.DIR_IN, gpio.EDGE_FALLING);
} else {
    console.log('This application needs to run on a Raspberry Pi with a button connected to GPIO pin '+appConfig.gpioPin);
}
