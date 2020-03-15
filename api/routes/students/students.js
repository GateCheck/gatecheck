const express = require('express');
const router = express.Router();
const Student = require('../../models/student');

router.get("/students", async (req, res) => {
    const students = [];
    for (const studentDoc of await Student.find()) {
        students.push(studentDoc.toJSON());
    }
    res.json(students);
});




module.exports = router;