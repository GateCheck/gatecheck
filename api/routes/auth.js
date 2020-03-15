const express = require('express');
const router = express.Router();
const {
    Student,
    Parent,
    Instructor
} = require('../models/index');

router.post('/signup/:signupAs', (req, res) => {
    const signupAs = req.params.signupAs.toLowerCase();
    switch (signupAs) {
        case 'student':
            const student = new Student({
                _id: new mongoose.Types.ObjectId(),
                contact: {
                    email: req.body.email.toLowerCase(),
                    phone: req.body.phone,
                },
                password: req.body.password,
                username: req.body.username.toLowerCase(),
                full_name: req.body.fullName,
                id_number: req.body.idNumber || -1,
                instructors: req.body.instructorIDs === undefined || req.body.instructorIDs === null ? null : req.body.instructorIDs.map(instructorID => Instructor.findById(instructorID)),
                parents: req.body.parentIDs === undefined || req.body.parentIDs === null ? null : req.body.parentIDs.map(parentID => Parent.findById(parentID)),
                profile_picture: req.body.profilePicture,
                school: req.body.school
            });
            student.save().then(studentDoc => {
                const data = studentDoc.toJSON();
                delete data.password;
                return res.status(201).json({
                    success: true,
                    studentCreated: data
                });
            }).catch(err => {
                console.error(err);
                res.status(500).json({
                    success: false,
                    error: err
                });
            });
            break;
        case 'instructor':
            const instructor = new Instructor({
                _id: new mongoose.Types.ObjectId(),
                contact: {
                    email: req.body.email.toLowerCase(),
                    phone: req.body.phone,
                },
                username: req.body.username.toLowerCase(),
                password: req.body.password,
                full_name: req.body.fullName,
                id_number: req.body.idNumber || -1,
                students: req.body.studentIDs === undefined || req.body.studentIDs === null ? null : req.body.studentIDs.map(studentID => Student.findById(studentID)),
                profile_picture: req.body.profilePicture,
                school: req.body.school
            });

            instructor.save().then(instructorDoc => {
                const data = instructorDoc.toJSON();
                delete data.password;
                res.status(201).json({
                    sucess: true,
                    instructorCreated: data
                });
            }).catch(err => {
                console.error(err);
                res.status(500).json({
                    success: false,
                    error: err
                });
            });
        case 'parent':
            const parent = new Parent({
                _id: new mongoose.Types.ObjectId(),
                children: req.body.childrenIDs === undefined || req.body.childrenIDs === null ? null : req.body.childrenIDs.map(childID => Student.findById(childID)),
                contact: {
                    email: req.body.email.toLowerCase(),
                    phone: req.body.phone,
                },
                username: req.body.username.toLowerCase(),
                password: req.body.password,
                full_name: req.body.fullName,
                id_number: req.body.idNumber || -1,
                partners: req.body.partnerIDs === undefined || req.body.partnerIDs === null ? null : req.body.partnerIDs.map(partnerID => Parent.findById(partnerID)),
                profile_picture: req.body.profilePicture
            });

            parent.save().then(parentDoc => {
                const data = parentDoc.toJSON();
                delete data.password;
                res.status(201).json({
                    sucess: true,
                    parentCreated: data
                });
            }).catch(err => {
                console.error(err);
                res.status(500).json({
                    success: false,
                    error: err
                });
            });

        default:
            res.status(400).json({success: false, error: "Please enter the type of user to create... /signup/parent, /signup/instructor, /signup/student"})
            break;
    }
});


module.exports = router;