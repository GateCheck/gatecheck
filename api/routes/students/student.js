const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Student = require('../../models/student');
const Instructor = require('../../models/instructor');
const Parent = require('../../models/parent');

router.get("/student", (req, res) => {
    const chosen = req.cookies.id || req.cookies.realid || req.cookies.email;
    if (req.query.id !== undefined) {
        Student.findById(chosen).exec().then(studentDoc => res.json({
            success: true,
            student: studentDoc.toJSON()
        })).catch(err => {
            console.error(err);
            res.status(404).json({
                success: false,
                error: `Couldn't find a document with ID "${chosen}".`
            });
        });
    } else if (req.query.realid !== undefined || req.query.email !== undefined) {
        Student.findOne({
            $or: [{
                    contact: {
                        email: chosen
                    }
                },
                {
                    id_number: Number.parseInt(chosen)
                }
            ]
        });
    }
});

router.post('/student', (req, res) => {
    const student = new Student({
        _id: new mongoose.Types.ObjectId(),
        contact: {
            email: req.body.email,
            phone: req.body.phone,
        },
        full_name: req.body.fullName,
        id_number: req.body.idNumber,
        instructors: req.body.instructorIDs === undefined || req.body.instructorIDs === null ? null : req.body.instructorIDs.map(instructorID => Instructor.findById(instructorID)),
        parents: req.body.parentIDs === undefined || req.body.parentIDs === null ? null : req.body.parentIDs.map(parentID => Parent.findById(parentID)),
        profile_picture: req.body.profilePicture,
        school: req.body.school
    })

    student.save().then(studentDoc => {
        res.status(200).json({
            sucess: true,
            studentCreated: studentDoc.toJSON()
        });
    }).catch(err => {
        console.error(err);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    });
});

module.exports = router;