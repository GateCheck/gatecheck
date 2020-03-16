const express = require('express');
const router = express.Router();
const {
    Request
} = require('../../models/index');
const getAuthenticatedUser = require('../../middleware/get-authenticated-user');

router.get("/requests", getAuthenticatedUser, async (req, res) => {
    const query = Request.find();

    if (req.user.administrative_level > 2)
        query.then(requestDocs => {
            res.status(200).json({
                success: true,
                message: "Requests made by: " + req.userData.fullName,
                requests: requestDocs.map(requestDoc => requestDoc.toJSON())
            });
        })
    else
        query.where({ issuer: req.user._id }).then(requestDocs => {
            res.status(200).json({
                success: true,
                message: "Requests made by: " + req.userData.fullName,
                requests: requestDocs.map(requestDoc => requestDoc.toJSON())
            });
        });
});

module.exports = router;