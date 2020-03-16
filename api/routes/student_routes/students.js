const express = require('express');
const router = express.Router();
const {
    Student
} = require('../../models/index');
const getUser = require('../../middleware/get-user');
const { removeConfidentialData } = require('../../utils');

router.get("/students", getUser, async (req, res) => {
    const students = [];
    
    if (req.user.administrative_level > 2) students = await Student.find();
    else if (req.user.modelName === 'Student') students.push(req.user);
    else if (req.user.modelName === 'Parent' && req.user.children !== null && req.user.children.length > 0) students = req.user.children;
    else if (req.user.modelName === 'Instructor' && req.user.students !== null && req.user.students > 0) students = req.user.students;
    
    res.status(200).json({
        success: true,
        students: students.map(student => removeConfidentialData(student, true))
    });
});


module.exports = router;
