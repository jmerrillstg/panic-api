var mysql = require('mysql'),
    appConfig = require('../../appConfig.js'),
    passwordHash = require('password-hash'),
    connection = mysql.createConnection(appConfig.dbConnect),
    nodemailer = require('nodemailer'),
    transporter = nodemailer.createTransport(appConfig.mailConfig);

exports.reset_password = function(req, res) {
    console.log(req.params.userEmail);
    var userQuery = 'SELECT user_id, user_name FROM users WHERE user_email=\''+req.params.userEmail+'\'';

    connection.query(userQuery, function (err, user) {
        if (err || !user || !user.length) {
            return res.sendStatus(404);
        } else {
            var newPassword=Math.random().toString(36).substr(2, 8);
            var changeQuery='UPDATE users SET password_mustchange=1, user_password=\''+passwordHash.generate(newPassword)+'\' WHERE user_id='+user[0].user_id;
            connection.query(changeQuery, function (err) {
                if (err) {
                    return res.sendStatus(500);
                } else {
                    var mailOptions = {
                        from: 'gutbomb@gmail.com',
                        to: req.params.userEmail,
                        subject: 'Panic Button Password Reset',
                        text: 'Hello '+user[0].user_name+',\n\rYour password has been reset to \''+newPassword+'\'.  Please visit http://localhost:3000/login to log in.'
                    };
                    transporter.sendMail(mailOptions, function(){});
                    return res.json({'status': 'password changed successfully'})
                }
            });

        }
    });
};
