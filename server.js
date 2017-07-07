var express = require('express'),
    app = express(),
    port = process.env.PORT || 3001,
    bodyParser = require('body-parser'),
    bearerToken = require('express-bearer-token'),
    gpio = require('rpi-gpio'),
    voicejs = require('voice.js');
var fs = require('fs');
var mailConfig = require('./mailConfig.js');
var text = process.argv[4] || 'This is a test sms from jason\'s raspberry pi';
var to = process.argv.slice(5).length ?  process.argv.slice(5) : ['18016130856', '16177497073'];
console.log(mailConfig.auth.user);
var client = new voicejs.Client({
    email: process.argv[2] || mailConfig.auth.user,
    password: process.argv[3] || mailConfig.auth.pass
});

function newToken(){ // check if the client has all the tokens
    var allRetrieved = true;
    var tokens = client.getTokens();

    ['auth', 'gvx', 'rnr'].forEach(function(type){
        if(!tokens.hasOwnProperty(type)){
            allRetrieved = false;
        }
    });

    if(allRetrieved){ // save tokens once all have been retrieved
        fs.writeFileSync('./tokens.json', JSON.stringify(tokens));
        console.log('\n\nALL TOKENS SAVED TO tokens.json')
    }
};


// Whenever a NEW token is retrieved, the corresponding event is emitted.
// Note: These events are only emitted when the newly-retrieved token is CHANGED or NEW.
client.on('auth', newToken);
client.on('gvx', newToken);
client.on('rnr', newToken)


// Get an auth token
client.auth(function(err, token){
    if(err){
        return console.log('.auth error: ', err);
    }

    console.log('\nNew auth token:');
    console.log(token);
});

// Get an rnr token
client.rnr(function(err, token){
    if(err){
        return console.log('.rnr error: ', err);
    }

    console.log('\nNew rnr token:');
    console.log(token);
});

// Get a gvx token
client.gvx(function(err, token){
    if(err){
        return console.log('.gvx error: ', err);
    }

    console.log('\nNew gvx token:');
    console.log(token);
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