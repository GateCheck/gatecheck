const express = require('express');
const router = express.Router();

const InstructorsController = require('../controllers/instructors');

const getAuthenticatedUser = require('../middleware/get-authenticated-user');  // Ensures the user is logged in. later on used to get what the user is allowed to view and access


router.get("/instructors", getAuthenticatedUser, InstructorsController.get_all_instructors);

router.get("/instructor/:instructorId", getAuthenticatedUser, InstructorsController.get_instructor);


module.exports = router;
