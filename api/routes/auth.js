const express = require('express');
const router = express.Router();

const getAuthenticatedUser = require('../middleware/get-authenticated-user'); // Must be an admin to delete an account or the user being deleted. ensures so.

const UserController = require('../controllers/user_management/index');

router.post('/signup/:signupAs', UserController.signup);

router.post('/login', UserController.login);

router.delete('/delete/:userId', getAuthenticatedUser, UserController.delete_user);

module.exports = router;
