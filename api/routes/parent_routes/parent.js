const express = require('express');
const router = express.Router();
const { Parent } = require('../../models/index');
const getUser = require('../../middleware/get-user');

router.get("/parent/:parentId", getUser, async (req, res) => {
    const parent = await Parent.findById(req.params.parentId);
    if (parent === null)
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    let allowAccess = req.user._id === req.params.parentId || await parent.hasChildWithId(req.userData.userId) || await parent.hasChildWithInstructorOfId(req.userData.userId);
    if (!allowAccess)
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    return res.status(200).json({
        success: true,
        message: 'Obtained parent\'s data',
        parent
    });
});


module.exports = router;
