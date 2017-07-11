var mysql = require('mysql'),
    appConfig = require('../../appConfig.js'),
    connection = mysql.createConnection(appConfig.dbConnect),
    jwt = require('jsonwebtoken'),
    verifyToken = require('../../verifyToken.js');

exports.get_message = function(req, res) {
    var messageQuery = 'SELECT message_text FROM messages';

    connection.query(messageQuery, function (err, message) {
        if (err || !message || !message.length) {
            return res.sendStatus(404);
        } else {
            return res.json(message);
        }
    });
};

exports.update_message = function(req, res) {
    if(verifyToken(req.token, appConfig.jwtKey)) {
        var decodedToken = jwt.decode(req.token);
        if (decodedToken.userLevel === 'admin') {

            var updateMessageQuery = 'UPDATE messages SET message_text=\'' + req.body.message_text + '\'';
            connection.query(updateMessageQuery, function (err) {
                if (err) {
                    return res.status(500).json({'status': 'Database error', 'errors': err});
                } else {
                    return res.json({'status': 'Message updated successfully'});
                }
            });
        } else {
            return res.status(403).json({'status': 'Permission denied.'});
        }
    } else {
        return res.status(401).json({'status': 'Invalid token.'});
    }
};