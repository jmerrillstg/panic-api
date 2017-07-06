var mysql = require('mysql');
var dbconnect = require('../../dbconnect.js');
var passwordHash = require('password-hash');
var connection = mysql.createConnection(dbconnect);
var jwt = require('jsonwebtoken');
var jwtKey = require('../../jwtKey.js');

exports.login = function(req, res) {
    var loginQuery = 'SELECT source_id, source_password, user_level FROM sources WHERE source_email=\''+req.body.username+'\'';

    connection.query(loginQuery, function (err, auth) {
        if (err || !auth || !auth.length) {
            return res.sendStatus(401);
        } else {
            if (passwordHash.verify(req.body.password, auth[0].source_password)){
                var token = jwt.sign({id: auth[0].source_id, userLevel: auth[0].user_level}, jwtKey);
                return res.json({'token' : token});
            } else {
                return res.sendStatus(401);
            }
        }
    });
};
