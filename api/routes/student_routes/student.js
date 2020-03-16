const express = require('express');
const router = express.Router();
const {
    Student,
} = require('../../models/index');
const { removeConfidentialData } = require('../../utils');
const getAuthenticatedUser = require('../../middleware/get-authenticated-user');


router.get("/student/:studentId", getAuthenticatedUser, (req, res) => {
    
});


module.exports = router;