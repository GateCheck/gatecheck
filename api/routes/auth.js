const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const {
    Student,
    Parent,
    Instructor
} = require('../models/index');

const createUser = (type, data) => {
    const {
        contact,
        password,
        username,
        fullName,
        idNumber,
        instructorIDs,
        parentIDs,
        partnerIDs,
        studentIDs,
        profilePicture,
        school
    } = data;
    const _id = new mongoose.Types.ObjectId();
    const _type = type.toLowerCase();
    const payload = {
        _id,
        contact,
        username,
        password,
        full_name: fullName,
        id_number: idNumber || -1,
        profile_picture: profilePicture
    }

    if (_type === 'student') {
        payload.instructors = instructorIDs === undefined || instructorIDs === null ? null : instructorIDs.map(instructorID => Instructor.findById(instructorID));
        payload.parents = parentIDs === undefined || parentIDs === null ? null : parentIDs.map(parentID => Parent.findById(parentID));
        payload.school = school;
        return new Student(payload);
    } else if (_type === 'parents') {
        payload.children = childrenIDs === undefined || childrenIDs === null ? null : childrenIDs.map(childID => Student.findById(childID));
        payload.partners = partnerIDs === undefined || partnerIDs === null ? null : partnerIDs.map(partnerID => Parent.findById(partnerID));
        return new Parent(payload);
    } else if (_type === 'instructor') {
        payload.students = studentIDs === undefined || studentIDs === null ? null : studentIDs.map(studentID => Student.findById(studentID));
        payload.school = school;
        return new Instructor(payload);
    }

    throw new Error('Invalid user type: ' + type);

}

router.post('/signup/:signupAs', (req, res) => {
    const signupAs = req.params.signupAs.toLowerCase();
    const user = createUser(signupAs, req.body);
    user.save().then(userDoc => {
        const data = userDoc.toJSON();
        delete data.password;
        res.status(201).json({
            success: true,
            [userDoc.collection.name.slice(0, userDoc.collection.name.length - 1) + 'Created']: data
        });
    });
});

router.delete('/delete/:userId', async (req, res) => {
    const userId = req.params.id;
    const isStudent = Student.exists({ _id: userId });
    const isParent = Parent.exists({ _id: userId });
    const isInstructor = Instructor.exists({ _id: userId });
    Promise.all(isStudent, isParent, isInstructor).then(([student, parent, instructor]) => {
        if (student) {
            Student.findByIdAndDelete(userId).then(doc => {
                const data = doc.toJSON();
                delete data.password;
                return res.status(204).json({
                    success: true,
                    message: 'User deleted!',
                    user: data
                });
            }).catch(err => {
                console.error(err);
                res.status(500).json({success: false, error: err});
            });
        } else if (parent) {
            Parent.findByIdAndDelete(userId).then(doc => {
                const data = doc.toJSON();
                delete data.password;
                return res.status(204).json({
                    success: true,
                    message: 'User deleted!',
                    user: data
                });
            }).catch(err => {
                console.error(err);
                res.status(500).json({success: false, error: err});
            });
        } else if (instructor) {
            Instructor.findByIdAndDelete(userId).then(doc => {
                const data = doc.toJSON();
                delete data.password;
                return res.status(204).json({
                    success: true,
                    message: 'User deleted!',
                    user: data
                });
            }).catch(err => {
                console.error(err);
                res.status(500).json({success: false, error: err});
            });
        }
    }).catch(err => {
        console.error(err);
        res.status(500).json({
            sucess: false,
            error: err
        });
    });    
});


module.exports = router;