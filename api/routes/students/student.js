const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Student, Parent, Instructor } = require('../../models/index');
const validator = require('validator').default;

router.get("/student/:id", (req, res) => {
    const id = req.params.id;
    if (id === undefined) {
        return res.status(400).json({ success: false, error: 'Invalid Database ID' });
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

// get student by real id or email or username
router.get("/student", (req, res) => {
    const chosen = req.query.id || req.query.email || req.query.username;
    if (req.query.realid !== undefined || req.query.email !== undefined) {
        Student.findOne({
            $or: [{
                    contact: {
                        email: chosen
                    }
                },
                {
                    id_number: Number.parseInt(chosen)
                },
                {
                    username: chosen
                }
            ]
        }).then(studentDoc => {
            const student = studentDoc.toJSON();
            delete student.password;
            res.status(200).json({success: true, student});
        });
    } else {
        res.status(400).json({success: false, error: "Pass a username, email or id in the query."})
    }
});

// create student
router.post('/student', (req, res) => {
    if (req.body.email === undefined || !validator.isEmail(req.body.email)) {
        return res.status(400).json({success: false, error: 'Invalid email!'});
    } else if (req.body.password === undefined || req.body.password.length < 8) {
        return res.status(400).json({success: false, error: "Please choose a longer password."})
    }
    const student = new Student({
        _id: new mongoose.Types.ObjectId(),
        contact: {
            email: req.body.email,
            phone: req.body.phone,
        },
        password: req.body.password,
        username: req.body.username,
        full_name: req.body.fullName,
        id_number: req.body.idNumber || -1,
        instructors: req.body.instructorIDs === undefined || req.body.instructorIDs === null ? null : req.body.instructorIDs.map(instructorID => Instructor.findById(instructorID)),
        parents: req.body.parentIDs === undefined || req.body.parentIDs === null ? null : req.body.parentIDs.map(parentID => Parent.findById(parentID)),
        profile_picture: req.body.profilePicture,
        school: req.body.school
    })

    student.save().then(studentDoc => {
        const student = studentDoc.toJSON();
        delete student.password;
        res.status(200).json({
            sucess: true,
            studentCreated: student
        });
    }).catch(err => {
        console.error(err);
        res.status(500).json({
            success: false,
            error: err
        });
    });
});

module.exports = router;