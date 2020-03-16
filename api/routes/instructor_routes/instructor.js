const express = require('express');
const router = express.Router();
const { Instructor } = require('../../models/index');
const getUser = require('../../middleware/get-user');
const { removeConfidentialData } = require('../../utils');

router.get("/instructor/:instructorId", getUser, async (req, res) => {
    const instructor = await Instructor.findById(req.params.instructorId);
    if (instructor === null)
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    let allowAccess = req.user.administrative_level > 2 || // admin requesting
        req.userData.userId == req.params.instructorId || // same user requesting
        instructor.isInstructorOfId(req.user._id) || // student of instructor requesting
        instructor.isInstructorOfChildWithParentIdOf(req.user._id); // parent requesting
    if (!allowAccess)
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    return res.status(200).json({
        success: true,
        message: 'Obtained instructor\'s data',
        instructor: removeConfidentialData(instructor, req.user.administrative_level > 2 || req.userData.userId == req.params.parentId)
    });
});


module.exports = router;
