const express = require('express');
const router = express.Router();
const { Parent } = require('../../models/index');
const getAuthenticatedUser = require('../../middleware/get-authenticated-user');
const { removeConfidentialData } = require('../../utils');

router.get("/parent/:parentId", getAuthenticatedUser, async (req, res) => {
    const parent = await Parent.findById(req.params.parentId);
    if (parent === null)
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    const isInstructorRequesting = await parent.hasChildWithInstructorOfId(req.userData.userId);
    const allowAccess = req.user.administrative_level > 2 || // admin requesting
        req.userData.userId == req.params.parentId || // same user requesting
        await parent.hasChildWithId(req.userData.userId) || // child of parent requesting
        isInstructorRequesting // instructor of a child of the parent requesting
    if (!allowAccess)
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    return res.status(200).json({
        success: true,
        message: 'Obtained parent\'s data',
        parent: removeConfidentialData(parent, req.user.administrative_level > 2 || req.userData.userId == req.params.parentId || isInstructorRequesting)
    });
});


module.exports = router;
