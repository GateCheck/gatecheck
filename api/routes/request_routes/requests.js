const express = require('express');
const router = express.Router();
const {
    Request,
    Student
} = require('../../models/index');
const checkAuth = require('../../middleware/check-auth');
const mongoose = require('mongoose')

router.get("/requests", checkAuth, async (req, res) => {
    const { userId, fullName } = req.userData;
    const query = Request.find();
    Student.findOne({ _id: userId }).then(student => {
        query.where({ issuer: student._id }).then(requestDocs => {
            res.status(200).json({
                success: true,
                message: "Requests made by: " + fullName,
                requests: requestDocs.map(requestDoc => requestDoc.toJSON())
            });
        });
    });
});

module.exports = router;