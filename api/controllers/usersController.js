var mysql = require('mysql');
var dbconnect = require('../../dbconnect.js');
var connection = mysql.createConnection(dbconnect);
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');
var jwtKey = require('../../jwtKey.js');
var verifyToken = require('../../verifyToken.js');

exports.get_users = function(req, res) {
    var whereClause='';
    if (typeof(req.params)!=='undefined'){
        if (typeof(req.params.userId)!=='undefined') {
            whereClause=' WHERE source_id='+req.params.userId;
        }
    }

    var usersQuery = 'SELECT source_id, source_email, source_name, password_mustchange, user_level FROM sources'+whereClause+' ORDER BY source_email';

    connection.query(usersQuery, function (err, users) {
        if (err || !users || !users.length) {
            return res.sendStatus(404);
        } else {
            return res.json(users);
        }
    });
};

exports.add_user = function(req, res) {
    if(verifyToken(req.token, jwtKey)) {
        var decodedToken = jwt.decode(req.token);
        if (decodedToken.userLevel==='admin') {
            var userQuery = 'SELECT email FROM users WHERE email=\'' + req.body.email + '\'';
            connection.query(userQuery, function (err, user) {
                if (err) {
                    return res.status(500).json({'status': 'Database error', 'errors': err});
                } else {
                    if (!user || !user.length) {
                        var addUserQuery = 'INSERT INTO users (first_name, last_name, email, user_level, password_must_change, password) VALUES (\'' + req.body.first_name + '\', \'' + req.body.last_name + '\', \'' + req.body.email + '\', \'' + req.body.user_level + '\', 1, \'' + passwordHash.generate('password') + '\')';
                        connection.query(addUserQuery, function (err) {
                            if (err) {
                                return res.status(500).json({'status': 'Database error'});
                            } else {
                                return res.json({'status': 'User added successfully'});
                            }
                        });
                    } else {
                        return res.status(409).json({'status': 'User already exists'});
                    }
                }
            });
        } else {
            return res.status(403).json({'status': 'Permission denied.'});
        }
    } else {
        return res.status(401).json({'status': 'Invalid token.'});
    }
};

exports.update_user = function(req, res) {
    if(verifyToken(req.token, jwtKey)) {
        var decodedToken = jwt.decode(req.token);
        if (decodedToken.id === req.params.userId || decodedToken.userLevel === 'admin') {

            var updateUserQuery = 'UPDATE sources SET source_name=\'' + req.body.source_name + '\', source_email=\'' + req.body.source_email + '\', user_level=\'' + req.body.user_level + '\' WHERE source_id=' + req.params.userId;
            connection.query(updateUserQuery, function (err) {
                if (err) {
                    return res.status(500).json({'status': 'Database error', 'errors': err});
                } else {
                    return res.json({'status': 'User updated successfully'});
                }
            });
        } else {
            return res.status(403).json({'status': 'Permission denied.'});
        }
    } else {
        return res.status(401).json({'status': 'Invalid token.'});
    }
};

exports.delete_user = function(req, res) {
    if(verifyToken(req.token, jwtKey)) {
        var decodedToken = jwt.decode(req.token);
        if (decodedToken.userLevel==='admin') {
            var deleteUserQuery='DELETE FROM users WHERE user_id='+req.params.userId;
            connection.query(deleteUserQuery, function (err) {
                if (err) {
                    return res.status(500).json({'status': 'Database error', 'errors': err});
                } else {
                    return res.json({'status': 'User deleted successfully'});
                }
            });
        } else {
            return res.status(403).json({'status': 'Permission denied.'});
        }
    } else {
        return res.status(401).json({'status': 'Invalid token.'});
    }
};
