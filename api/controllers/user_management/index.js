const LoginController = require('./login');
const SignupController = require('./signup');

module.exports = {
    ...LoginController,
    ...SignupController
}