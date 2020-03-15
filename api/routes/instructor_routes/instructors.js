const express = require('express');
const router = express.Router();
const {
    Instructor
} = require('../../models/index');

router.get("/instructors", async (req, res) => {
    const instructors = [];
    for (const instructorDoc of await Instructor.find()) {
        const instructor = instructorDoc.toJSON();
        delete instructor.password;
        instructors.push(instructor);
    }
    res.json(instructors);
});



module.exports = router;
