'use strict';
module.exports = function(app) {
    var authController = require('../controllers/authController');
    var changePasswordController = require('../controllers/changePasswordController');
    var resetPasswordController = require('../controllers/resetPasswordController');
    var usersController = require('../controllers/usersController');

    app.route('/api/auth')
    .post(authController.login);

    app.route('/api/change-password')
    .put(changePasswordController.change_password);

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