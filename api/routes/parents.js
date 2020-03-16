const express = require('express');
const router = express.Router();

const ParentsController = require('../controllers/parents');

const getAuthenticatedUser = require('../middleware/get-authenticated-user');


router.get("/parents", getAuthenticatedUser, ParentsController.get_all_parents);

router.get("/parent/:parentId", getAuthenticatedUser, ParentsController.get_parent);


module.exports = router;
