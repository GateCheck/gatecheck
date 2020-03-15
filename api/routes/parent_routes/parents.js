const express = require('express');
const router = express.Router();
const {
    Parent
} = require('../../models/index');

router.get("/parents", async (req, res) => {
    const parents = [];
    for (const parentDoc of await Parent.find()) {
        const parent = parentDoc.toJSON();
        delete parent.password;
        parents.push(parent);
    }
    res.json(parents);
});


module.exports = router;
