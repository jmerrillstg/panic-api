var mysql = require('mysql'),
    appConfig = require('../../appConfig.js'),
    connection = mysql.createConnection(appConfig.dbConnect),
    jwt = require('jsonwebtoken'),
    verifyToken = require('../../verifyToken.js');

exports.get_recipients = function(req, res) {
    if(verifyToken(req.token, appConfig.jwtKey)) {
        var whereClause = '';
        if (typeof(req.params) !== 'undefined') {
            if (typeof(req.params.recipientId) !== 'undefined') {
                whereClause = ' WHERE recipient_id=' + req.params.recipientId;
            }
        }

        var recipientsQuery = 'SELECT recipient_id, recipient_email, recipient_name, recipient_phone FROM recipients' + whereClause + ' ORDER BY recipient_email';

        connection.query(recipientsQuery, function (err, recipients) {
            if (err || !recipients || !recipients.length) {
                return res.sendStatus(404);
            } else {
                return res.json(recipients);
            }
        });
    }
};

exports.add_recipient = function(req, res) {
    if(verifyToken(req.token, appConfig.jwtKey)) {
        var decodedToken = jwt.decode(req.token);
        if (decodedToken.userLevel==='admin') {
            var recipientQuery = 'SELECT recipient_email FROM recipients WHERE recipient_email=\'' + req.body.email + '\'';
            connection.query(recipientQuery, function (err, recipient) {
                if (err) {
                    return res.status(500).json({'status': 'Database error', 'errors': err});
                } else {
                    if (!recipient || !recipient.length) {
                        var newPassword=Math.random().toString(36).substr(2, 8);
                        var addrecipientQuery = 'INSERT INTO recipients (recipient_name, recipient_email, recipient_phone) VALUES (\'' + req.body.name + '\', \'' + req.body.email + '\', \'' + req.body.phone + '\')';
                        connection.query(addrecipientQuery, function (err) {
                            if (err) {
                                return res.status(500).json({'status': 'Database error'});
                            } else {
                                return res.json({'status': 'recipient added successfully'});
                            }
                        });
                    } else {
                        return res.status(409).json({'status': 'recipient already exists'});
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

exports.update_recipient = function(req, res) {
    if(verifyToken(req.token, appConfig.jwtKey)) {
        var decodedToken = jwt.decode(req.token);
        if (decodedToken.id === req.params.recipientId || decodedToken.userLevel === 'admin') {

            var updaterecipientQuery = 'UPDATE recipients SET recipient_name=\'' + req.body.recipient_name + '\', recipient_email=\'' + req.body.recipient_email + '\', recipient_phone=\'' + req.body.recipient_phone + '\' WHERE recipient_id=' + req.params.recipientId;
            connection.query(updaterecipientQuery, function (err) {
                if (err) {
                    return res.status(500).json({'status': 'Database error', 'errors': err});
                } else {
                    return res.json({'status': 'recipient updated successfully'});
                }
            });
        } else {
            return res.status(403).json({'status': 'Permission denied.'});
        }
    } else {
        return res.status(401).json({'status': 'Invalid token.'});
    }
};

exports.delete_recipient = function(req, res) {
    if(verifyToken(req.token, appConfig.jwtKey)) {
        var decodedToken = jwt.decode(req.token);
        if (decodedToken.userLevel==='admin') {
            var deleterecipientQuery='DELETE FROM recipients WHERE recipient_id='+req.params.recipientId;
            connection.query(deleterecipientQuery, function (err) {
                if (err) {
                    return res.status(500).json({'status': 'Database error', 'errors': err});
                } else {
                    return res.json({'status': 'recipient deleted successfully'});
                }
            });
        } else {
            return res.status(403).json({'status': 'Permission denied.'});
        }
    } else {
        return res.status(401).json({'status': 'Invalid token.'});
    }
};
