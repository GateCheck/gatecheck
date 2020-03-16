const express = require('express');
const router = express.Router();

const StudentsController = require('../controllers/students');

const getAuthenticatedUser = require('../middleware/get-authenticated-user');


router.get("/student/:studentId", getAuthenticatedUser, StudentsController.get_student);
router.get("/students", getAuthenticatedUser, StudentsController.get_all_students);


module.exports = router;