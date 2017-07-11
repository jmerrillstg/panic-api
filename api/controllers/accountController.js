var mysql = require('mysql'),
    appConfig = require('../../appConfig.js'),
    connection = mysql.createConnection(appConfig.dbConnect),
    passwordHash = require('password-hash'),
    jwt = require('jsonwebtoken'),
    verifyToken = require('../../verifyToken.js'),
    nodemailer = require('nodemailer'),
    transporter = nodemailer.createTransport(appConfig.mailConfig);

exports.update_account = function(req, res) {
    if(verifyToken(req.token, appConfig.jwtKey)) {
    var decodedToken = jwt.decode(req.token);
    var updateUserQuery = 'UPDATE users SET user_name=\'' + req.body.user_name + '\', user_email=\'' + req.body.user_email + '\' WHERE user_id=' + decodedToken.id;
        connection.query(updateUserQuery, function (err) {
            if (err) {
                return res.status(500).json({'status': 'Database error', 'errors': err});
            } else {
                return res.json({'status': 'User updated successfully'});
            }
        });
    } else {
        return res.status(401).json({'status': 'Invalid token.'});
    }
};
