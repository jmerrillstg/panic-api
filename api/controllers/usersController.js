var mysql = require('mysql');
var dbconnect = require('../../dbconnect.js');
var connection = mysql.createConnection(dbconnect);
var passwordHash = require('password-hash');
var jwt = require('jsonwebtoken');
var jwtKey = require('../../jwtKey.js');
var verifyToken = require('../../verifyToken.js');
var nodemailer = require('nodemailer');
var mailConfig = require('../../mailConfig.js');
var transporter = nodemailer.createTransport(mailConfig);
var appUrl = require('../../appUrl.js');

exports.get_users = function(req, res) {
    var whereClause='';
    if (typeof(req.params)!=='undefined'){
        if (typeof(req.params.userId)!=='undefined') {
            whereClause=' WHERE user_id='+req.params.userId;
        }
    }

    var usersQuery = 'SELECT user_id, user_email, user_name, password_mustchange, user_level, last_login_time, user_created_time FROM users'+whereClause+' ORDER BY user_email';

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
            var userQuery = 'SELECT user_email FROM users WHERE user_email=\'' + req.body.email + '\'';
            connection.query(userQuery, function (err, user) {
                if (err) {
                    return res.status(500).json({'status': 'Database error', 'errors': err});
                } else {
                    if (!user || !user.length) {
                        var newPassword=Math.random().toString(36).substr(2, 8);
                        var addUserQuery = 'INSERT INTO users (user_name, user_email, user_level, password_mustchange, user_password) VALUES (\'' + req.body.user_name + '\', \'' + req.body.email + '\', \'' + req.body.user_level + '\', 1, \'' + passwordHash.generate(newPassword) + '\')';
                        connection.query(addUserQuery, function (err) {
                            if (err) {
                                return res.status(500).json({'status': 'Database error'});
                            } else {
                                var mailOptions = {
                                    from: 'gutbomb@gmail.com',
                                    to: req.body.email,
                                    subject: 'Panic Button - New Account',
                                    text: 'Hello '+req.body.user_name+',\n\rAn account has been created for you on the STG Panic Button system.  Your username is \''+req.body.email+'\' and your password is \''+newPassword+'\'.  Please visit '+appUrl+' to log in.'
                                };
                                transporter.sendMail(mailOptions, function(){});
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

            var updateUserQuery = 'UPDATE users SET user_name=\'' + req.body.user_name + '\', user_email=\'' + req.body.user_email + '\', user_level=\'' + req.body.user_level + '\' WHERE user_id=' + req.params.userId;
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
