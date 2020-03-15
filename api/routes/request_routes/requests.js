const express = require('express');
const router = express.Router();
const {
    Request
} = require('../../models/index');
const checkAuth = require('../../middleware/check-auth');

router.get("/requests", checkAuth, async (req, res) => {
    const { userId, fullName } = req.userData;
    const requests = [];
    Request.find({ 'issuer': userId }).then(requestsByUser => {
        requestsByUser.forEach(req => {
            requests.push(req);
        });
    });
    res.status(200).json({
        success: true,
        message: "Requests made by: " + fullName,
        requests
    })
});

module.exports = router;