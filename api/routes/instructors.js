const express = require('express');
const router = express.Router();

const InstructorsController = require('../../controllers/instructors');

const getAuthenticatedUser = require('../../middleware/get-authenticated-user');


router.get("/instructors", getAuthenticatedUser, InstructorsController.get_all_instructors);

router.get("/instructor/:instructorId", getAuthenticatedUser, InstructorsController.get_instructor);


module.exports = router;
