const express = require('express');
const router = express.Router();
const { removeConfidentialData } = require('../utils');

const getAuthenticatedUser = require('../middleware/get-authenticated-user'); // Must be an admin to delete an account or the user being deleted. ensures so.

const UserController = require('../controllers/user_management');

router.post('/signup', UserController.signup);

router.post('/login', UserController.login);

router.delete('/delete/:userId', getAuthenticatedUser, UserController.delete_user);

router.patch('/changetype/:userId', getAuthenticatedUser, UserController.change_user_kind);

module.exports = router;
