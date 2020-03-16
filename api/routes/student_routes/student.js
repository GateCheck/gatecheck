const express = require('express');
const router = express.Router();
const {
    Student,
} = require('../../models/index');
const { removeConfidentialData } = require('../../utils');
const getAuthenticatedUser = require('../../middleware/get-authenticated-user');


router.get("/student/:studentId", getAuthenticatedUser, async (req, res) => {
    const student = await Student.findById(req.params.studentId);
    if (student === null)
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });

    const allowAccess = req.user.administrative_level > 2 ||
        student._id == req.user._id ||
        student.hasParentWithIdOf(req.user._id) ||
        student.hasInstructorWithIdOf(req.user._id);

    if (!allowAccess)
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    return res.status(200).json({
        success: true,
        message: 'Obtained student\'s data',
        student: removeConfidentialData(student, true)
    });

});


module.exports = router;