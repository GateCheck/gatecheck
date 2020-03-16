const express = require('express');
const router = express.Router();

const ParentsController = require('../controllers/parents');

const getAuthenticatedUser = require('../middleware/get-authenticated-user'); // Ensures the user is logged in. later on used to get what the user is allowed to view and access

router.get('/parents', getAuthenticatedUser, ParentsController.get_all_parents);

router.get('/parent/:parentId', getAuthenticatedUser, ParentsController.get_parent);

module.exports = router;
