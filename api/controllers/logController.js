var mysql = require('mysql'),
    appConfig = require('../../appConfig.js'),
    connection = mysql.createConnection(appConfig.dbConnect),
    jwt = require('jsonwebtoken'),
    verifyToken = require('../../verifyToken.js');

exports.get_log = function(req, res) {
    if(verifyToken(req.token, appConfig.jwtKey)) {
        var decodedToken = jwt.decode(req.token);
        if (decodedToken.userLevel==='admin') {
            var logQuery = 'SELECT log_time FROM log ORDER BY log_time DESC';

            connection.query(logQuery, function (err, log) {
                if (err || !log || !log.length) {
                    return res.sendStatus(404);
                } else {
                    return res.json({"count": log.length, "log":log});
                }
            });
        } else {
            return res.status(403).json({'status': 'Permission denied.'});
        }
    } else {
        return res.status(401).json({'status': 'Invalid token.'});
    }
};