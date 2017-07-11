'use strict';
module.exports = function(app) {
    var accountController = require('../controllers/accountController');
    var authController = require('../controllers/authController');
    var changePasswordController = require('../controllers/changePasswordController');
    var logController = require('../controllers/logController');
    var messageController = require('../controllers/messageController');
    var resetPasswordController = require('../controllers/resetPasswordController');
    var recipientsController = require('../controllers/recipientsController');
    var usersController = require('../controllers/usersController');

    app.route('/api/auth')
    .post(authController.login);

    app.route('/api/change-password')
    .put(changePasswordController.change_password);

    app.route('/api/log')
    .get(logController.get_log);

    app.route('/api/message')
    .get(messageController.get_message)
    .put(messageController.update_message);

    app.route('/api/profile')
    .put(accountController.update_account);

    app.route('/api/recipient')
    .get(recipientsController.get_recipients)
    .post(recipientsController.add_recipient);

    app.route('/api/recipient/:recipientId')
    .get(recipientsController.get_recipients)
    .put(recipientsController.update_recipient)
    .delete(recipientsController.delete_recipient);

    app.route('/api/user')
    .get(usersController.get_users)
    .post(usersController.add_user);

    app.route('/api/user/:userId')
    .get(usersController.get_users)
    .put(usersController.update_user)
    .delete(usersController.delete_user);

    app.route('/api/reset-password/:userEmail')
    .get(resetPasswordController.reset_password);
};