const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {
    Student,
    Parent,
    Instructor
} = require('../../models/index');
const validator = require('validator').default;

// get student from db
router.get("/student/:id", (req, res) => {
    const id = req.params.id;
    if (id === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Invalid Database ID'
        });
    }
    Student.findById(id).exec().then(studentDoc => {
        const student = studentDoc.toJSON();
        delete student.password;
        res.status(200).json({
            success: true,
            student
        });
    }).catch(err => {
        console.error(err);
        res.status(400).json({
            success: false,
            error: `Couldn't find a document with ID "${id}".`
        });
    });
});


module.exports = router;