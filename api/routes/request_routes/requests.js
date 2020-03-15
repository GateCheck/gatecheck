const express = require('express');
const router = express.Router();
const {
    Request
} = require('../../models/index');

router.get("/requests", async (req, res) => {
    const requests = [];
    for (const requestDoc of await Request.find()) {
        const request = requestDoc.toJSON();
        requests.push(request);
    }
    res.json(requests);
});



module.exports = router;
