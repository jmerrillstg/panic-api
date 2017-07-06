var jwt = require('jsonwebtoken');

module.exports = function (token, jwtKey) {
    try {
        jwt.verify(token, jwtKey);
        return true;
    } catch(err) {
        return false;
    }
};