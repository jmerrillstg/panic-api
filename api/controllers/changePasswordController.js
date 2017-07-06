var mysql = require('mysql');
var dbconnect = require('../../dbconnect.js');
var passwordHash = require('password-hash');
var connection = mysql.createConnection(dbconnect);
var jwt = require('jsonwebtoken');



exports.change_password = function(req, res) {
    var decodedToken=jwt.decode(req.token);
    var userQuery = 'SELECT source_password FROM sources WHERE source_id='+decodedToken.id;

    connection.query(userQuery, function (err, user) {
        if (err || !user || !user.length) {
            return res.sendStatus(404);
        } else {
            if (passwordHash.verify(req.body.oldPassword, user[0].source_password)){
                var changeQuery='UPDATE sources SET password_mustchange=0, source_password=\''+passwordHash.generate(req.body.newPassword)+'\' WHERE source_id='+decodedToken.id;
                connection.query(changeQuery, function (err, user) {
                    if (err) {
                        return res.sendStatus(500);
                    } else {
                        return res.json({'status': 'password changed successfully'})
                    }
                });
            } else {
                return res.sendStatus(401);
            }
        }
    });
};
