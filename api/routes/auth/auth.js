const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator').default;
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
    Student,
    Parent,
    Instructor
} = require('../../models/index');
const {
    userExists,
} = require('../../utils');
const {
    buildModelSignup,
    LoginController
} = require('./utils')

const login = (user, password) => {
    if (user === null) {
        return Promise.resolve(false);
    }
    return new Promise((resolve, reject) => {
        user.comparePassword(password, (err, success) => {
            if (err) {
                return resolve(false);
            }
            resolve(success);
        });
    })
}

const createUser = async (type, data) => {
    const {
        email,
        phone,
        password,
        username,
        fullName,
        idNumber,
        instructorIDs,
        parentIDs,
        partnerIDs,
        studentIDs,
        childrenIDs,
        profilePicture,
        school
    } = data;
    if (password.length < 8) {
        return 'Choose a longer password!';
    } else if (!validator.isEmail(email)) {
        return 'Not a valid email!';
    }

    if (await userExists(email, username, idNumber)) {
        return `User already exists!`;
    }

    const _id = new mongoose.Types.ObjectId();
    const _type = type.toLowerCase();
    const payload = {
        _id,
        contact: {
            email,
            phone
        },
        username,
        password,
        full_name: fullName,
        id_number: idNumber || -1,
        profile_picture: profilePicture
    }

    return buildModelSignup(payload, _type, instructorIDs, parentIDs, studentIDs, partnerIDs, childrenIDs, school);

}

router.post('/signup/:signupAs', async (req, res) => {
    const signupAs = req.params.signupAs.toLowerCase();

    createUser(signupAs, req.body).then(user => {
        typeof user === typeof '' ? res.status(400).json({ // show the reason the user was not created
            success: false,
            message: user
        }) : user.save().then(userDoc => { // user was created successfully! show user data
            const data = userDoc.toJSON();
            delete data.password;
            res.status(201).json({
                success: true,
                [userDoc.collection.name.slice(0, userDoc.collection.name.length - 1) + 'Created']: data
            });
        });
    }).catch(err => {
        console.error(err);
        res.status(400).json({
            success: false,
            error: err.message
        })
    });
});

router.post('/login', (req, res) => {
    const {
        username,
        email,
        password,
        id
    } = req.body;
    
    const loginController = new LoginController({ username, email, id }, password, res);
    loginController.login();
    
});

router.delete('/delete/:userId', async (req, res) => {
    const userId = req.params.id;
    const isStudent = Student.exists({
        _id: userId
    });
    const isParent = Parent.exists({
        _id: userId
    });
    const isInstructor = Instructor.exists({
        _id: userId
    });
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
                res.status(500).json({
                    success: false,
                    error: err
                });
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
                res.status(500).json({
                    success: false,
                    error: err
                });
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
                res.status(500).json({
                    success: false,
                    error: err
                });
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