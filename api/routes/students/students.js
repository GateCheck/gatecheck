const express = require('express');
const router = express.Router();
const {
    Student
} = require('../../models/index');

router.get("/students", async (req, res) => {
    const students = [];
    for (const studentDoc of await Student.find()) {
        const student = studentDoc.toJSON();
        delete student.password;
        delete student.id_number;
        students.push(student);
    }
    res.json(students);
});




module.exports = router;