const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user_management/index');

router.post('/signup/:signupAs', UserController.signup);

router.post('/login', UserController.login);

router.delete('/delete/:userId', UserController.delete_user);

module.exports = router;
